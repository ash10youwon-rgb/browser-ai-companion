/**
 * Isolated Sandbox Runner
 * Executes untrusted user JavaScript in a completely isolated Web Worker thread.
 * Ensures NO access to the main DOM, window, document, cookies, or localStorage.
 * Includes timeout protection against infinite loops.
 */

export interface SandboxLog {
  id: string;
  level: "log" | "warn" | "error" | "info";
  message: string;
  time: string;
}

export interface SandboxExecutionResult {
  success: boolean;
  logs: SandboxLog[];
  durationMs: number;
  error?: string;
}

export function runIsolatedJavaScript(
  code: string,
  timeoutMs = 4000,
): Promise<SandboxExecutionResult> {
  return new Promise((resolve) => {
    const startTime = performance.now();
    const logs: SandboxLog[] = [];

    // Worker code template that intercepts console methods and executes user code
    const workerScript = `
      self.onmessage = function(e) {
        const userCode = e.data.code;
        const start = performance.now();
        
        function sendLog(level, args) {
          try {
            const message = args.map(a => {
              if (typeof a === 'object' && a !== null) {
                try { return JSON.stringify(a, null, 2); } catch (_) { return String(a); }
              }
              return String(a);
            }).join(' ');
            self.postMessage({ type: 'LOG', level: level, message: message, time: new Date().toLocaleTimeString() });
          } catch(err) {
            self.postMessage({ type: 'LOG', level: 'error', message: String(err), time: new Date().toLocaleTimeString() });
          }
        }

        const customConsole = {
          log: (...args) => sendLog('log', args),
          warn: (...args) => sendLog('warn', args),
          error: (...args) => sendLog('error', args),
          info: (...args) => sendLog('info', args),
        };

        try {
          // Block access to importScripts in untrusted code
          self.importScripts = undefined;
          
          const runner = new Function('console', 'performance', userCode);
          runner(customConsole, performance);
          
          const duration = Math.round(performance.now() - start);
          self.postMessage({ type: 'DONE', success: true, duration: duration });
        } catch (err) {
          const errMsg = err && err.message ? err.message : String(err);
          self.postMessage({ type: 'DONE', success: false, error: errMsg, duration: Math.round(performance.now() - start) });
        }
      };
    `;

    let worker: Worker | null = null;
    let isSettled = false;
    let timeoutTimer: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      if (timeoutTimer) {
        clearTimeout(timeoutTimer);
        timeoutTimer = null;
      }
      if (worker) {
        worker.terminate();
        worker = null;
      }
    };

    try {
      const blob = new Blob([workerScript], { type: "application/javascript" });
      const blobUrl = URL.createObjectURL(blob);
      worker = new Worker(blobUrl);
      URL.revokeObjectURL(blobUrl);

      timeoutTimer = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          cleanup();
          resolve({
            success: false,
            logs,
            durationMs: timeoutMs,
            error: `Execution timed out after ${timeoutMs}ms (infinite loop protection).`,
          });
        }
      }, timeoutMs);

      worker.onmessage = (event: MessageEvent) => {
        if (isSettled) return;

        const data = event.data;
        if (!data || typeof data !== "object") return;

        if (data.type === "LOG") {
          logs.push({
            id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            level: data.level || "log",
            message: data.message || "",
            time: data.time || new Date().toLocaleTimeString(),
          });
        } else if (data.type === "DONE") {
          isSettled = true;
          const duration = Math.max(1, Math.round(performance.now() - startTime));
          cleanup();
          resolve({
            success: Boolean(data.success),
            logs,
            durationMs: typeof data.duration === "number" ? data.duration : duration,
            error: data.error,
          });
        }
      };

      worker.onerror = (errEvent: ErrorEvent) => {
        if (isSettled) return;
        isSettled = true;
        cleanup();
        resolve({
          success: false,
          logs,
          durationMs: Math.max(1, Math.round(performance.now() - startTime)),
          error: errEvent.message || "Worker execution error",
        });
      };

      worker.postMessage({ code });
    } catch (createErr: unknown) {
      cleanup();
      resolve({
        success: false,
        logs: [],
        durationMs: 0,
        error: `Could not launch sandbox worker: ${(createErr as Error)?.message || String(createErr)}`,
      });
    }
  });
}
