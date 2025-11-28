declare global {
  interface Window {
    loadPyodide: any;
  }
}

class PythonService {
  private pyodide: any = null;
  private isLoading: boolean = false;
  private outputCallback: ((text: string) => void) | null = null;

  async init() {
    if (this.pyodide) return;
    if (this.isLoading) return;

    this.isLoading = true;
    try {
      if (!window.loadPyodide) {
        throw new Error("Pyodide script not loaded in index.html");
      }
      this.pyodide = await window.loadPyodide();
      
      // Redirect stdout
      this.pyodide.setStdout({
        batched: (text: string) => {
          if (this.outputCallback) {
            this.outputCallback(text);
          }
        }
      });
      
      console.log("Pyodide Ready");
    } catch (err) {
      console.error("Failed to load Pyodide", err);
    } finally {
      this.isLoading = false;
    }
  }

  setOutputCallback(cb: (text: string) => void) {
    this.outputCallback = cb;
  }

  async runPython(code: string): Promise<any> {
    if (!this.pyodide) await this.init();

    try {
      // We wrap the code to ensure input() works roughly within limits or standard exec
      // Note: Standard Pyodide input() uses window.prompt which is blocking. 
      // This is acceptable for this educational level.
      await this.pyodide.loadPackagesFromImports(code);
      return await this.pyodide.runPythonAsync(code);
    } catch (err: any) {
      throw err;
    }
  }

  reset() {
    // Resetting Pyodide context is complex, simplest is to clear globals manually if needed
    // or just let variables overwrite. For this course, persistence is actually helpful.
  }
}

export const pythonService = new PythonService();