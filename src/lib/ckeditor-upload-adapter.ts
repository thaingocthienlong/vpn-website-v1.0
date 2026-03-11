/**
 * CKEditor 5 Upload Adapter
 * Connects CKEditor's image upload to our /api/admin/upload endpoint
 */

interface CKEditorLoader {
    file: Promise<File>;
}

interface CKEditorEditor {
    plugins: {
        get(name: string): {
            createUploadAdapter: (loader: CKEditorLoader) => UploadAdapter;
        };
    };
}

class UploadAdapter {
    private loader: CKEditorLoader;
    private controller: AbortController | null = null;

    constructor(loader: CKEditorLoader) {
        this.loader = loader;
    }

    async upload(): Promise<{ default: string }> {
        const file = await this.loader.file;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "editor");

        this.controller = new AbortController();

        const response = await fetch("/api/admin/upload", {
            method: "POST",
            body: formData,
            signal: this.controller.signal,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.error || "Upload failed");
        }

        const result = await response.json();
        return { default: result.url };
    }

    abort(): void {
        if (this.controller) {
            this.controller.abort();
        }
    }
}

/**
 * CKEditor plugin function to register our custom upload adapter
 * Usage: extraPlugins: [UploadAdapterPlugin]
 */
export function UploadAdapterPlugin(editor: CKEditorEditor): void {
    editor.plugins.get("FileRepository").createUploadAdapter = (
        loader: CKEditorLoader
    ) => {
        return new UploadAdapter(loader);
    };
}
