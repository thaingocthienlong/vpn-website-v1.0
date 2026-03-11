"use client";

import { useEffect, useRef, useState } from "react";

interface CKEditorWrapperProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    variant?: "full" | "mini";
    minHeight?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let editorModules: any = null;

// Full toolbar config
const FULL_TOOLBAR = {
    items: [
        "undo", "redo",
        "|",
        "heading",
        "|",
        "fontSize", "fontFamily",
        "|",
        "bold", "italic", "underline", "strikethrough", "code", "subscript", "superscript",
        "|",
        "fontColor", "fontBackgroundColor", "highlight",
        "|",
        "alignment",
        "|",
        "link", "uploadImage", "mediaEmbed", "insertTable", "blockQuote",
        "codeBlock", "htmlEmbed", "horizontalLine", "pageBreak", "specialCharacters",
        "|",
        "bulletedList", "numberedList", "todoList",
        "|",
        "outdent", "indent",
        "|",
        "removeFormat", "findAndReplace", "selectAll", "showBlocks", "sourceEditing",
    ],
    shouldNotGroupWhenFull: true,
};

// Mini toolbar config (for excerpts)
const MINI_TOOLBAR = {
    items: [
        "bold", "italic", "underline", "strikethrough",
        "|",
        "link",
        "|",
        "bulletedList", "numberedList",
        "|",
        "undo", "redo",
        "|",
        "removeFormat",
    ],
    shouldNotGroupWhenFull: true,
};

export function CKEditorWrapper({ value, onChange, placeholder, variant = "full" }: CKEditorWrapperProps) {
    const [loaded, setLoaded] = useState(false);
    const editorRef = useRef<boolean>(false);

    useEffect(() => {
        if (editorRef.current) return;
        editorRef.current = true;

        // Dynamic import to avoid SSR issues
        Promise.all([
            import("@ckeditor/ckeditor5-react"),
            import("ckeditor5"),
        ]).then(([ckeditorReact, ck]) => {
            editorModules = {
                CKEditorComponent: ckeditorReact.CKEditor,
                ClassicEditor: ck.ClassicEditor,
                plugins: {
                    Essentials: ck.Essentials,
                    Paragraph: ck.Paragraph,
                    // Text formatting
                    Bold: ck.Bold,
                    Italic: ck.Italic,
                    Strikethrough: ck.Strikethrough,
                    Underline: ck.Underline,
                    Code: ck.Code,
                    Subscript: ck.Subscript,
                    Superscript: ck.Superscript,
                    // Font
                    FontSize: ck.FontSize,
                    FontFamily: ck.FontFamily,
                    FontColor: ck.FontColor,
                    FontBackgroundColor: ck.FontBackgroundColor,
                    // Structure
                    Heading: ck.Heading,
                    Alignment: ck.Alignment,
                    BlockQuote: ck.BlockQuote,
                    CodeBlock: ck.CodeBlock,
                    HorizontalLine: ck.HorizontalLine,
                    // Lists
                    List: ck.List,
                    TodoList: ck.TodoList,
                    // Indentation
                    Indent: ck.Indent,
                    IndentBlock: ck.IndentBlock,
                    // Links & Media
                    Link: ck.Link,
                    AutoLink: ck.AutoLink,
                    ImageUpload: ck.ImageUpload,
                    ImageInsert: ck.ImageInsert,
                    ImageBlock: ck.ImageBlock,
                    ImageInline: ck.ImageInline,
                    ImageCaption: ck.ImageCaption,
                    ImageResize: ck.ImageResize,
                    ImageStyle: ck.ImageStyle,
                    ImageToolbar: ck.ImageToolbar,
                    MediaEmbed: ck.MediaEmbed,
                    // Tables
                    Table: ck.Table,
                    TableToolbar: ck.TableToolbar,
                    TableCaption: ck.TableCaption,
                    TableProperties: ck.TableProperties,
                    TableCellProperties: ck.TableCellProperties,
                    TableColumnResize: ck.TableColumnResize,
                    // Misc
                    Undo: ck.Undo,
                    RemoveFormat: ck.RemoveFormat,
                    FindAndReplace: ck.FindAndReplace,
                    SourceEditing: ck.SourceEditing,
                    GeneralHtmlSupport: ck.GeneralHtmlSupport,
                    HtmlEmbed: ck.HtmlEmbed,
                    Highlight: ck.Highlight,
                    SpecialCharacters: ck.SpecialCharacters,
                    SpecialCharactersEssentials: ck.SpecialCharactersEssentials,
                    PageBreak: ck.PageBreak,
                    ShowBlocks: ck.ShowBlocks,
                    SelectAll: ck.SelectAll,
                    TextTransformation: ck.TextTransformation,
                    AutoFormat: ck.Autoformat,
                    PasteFromOffice: ck.PasteFromOffice,
                },
            };
            setLoaded(true);
        }).catch((err) => {
            console.error("Failed to load CKEditor:", err);
        });
    }, []);

    if (!loaded || !editorModules) {
        return (
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 text-slate-500 text-sm animate-pulse min-h-[200px] flex items-center justify-center">
                Đang tải trình soạn thảo...
            </div>
        );
    }

    const { CKEditorComponent, ClassicEditor, plugins } = editorModules;
    const isFull = variant === "full";

    // Build plugin list based on variant
    const fullPlugins = [
        plugins.Essentials,
        plugins.Paragraph,
        plugins.Bold, plugins.Italic, plugins.Strikethrough, plugins.Underline,
        plugins.Code, plugins.Subscript, plugins.Superscript,
        plugins.FontSize, plugins.FontFamily, plugins.FontColor, plugins.FontBackgroundColor,
        plugins.Heading, plugins.Alignment,
        plugins.BlockQuote, plugins.CodeBlock, plugins.HorizontalLine,
        plugins.List, plugins.TodoList,
        plugins.Indent, plugins.IndentBlock,
        plugins.Link, plugins.AutoLink,
        plugins.ImageUpload, plugins.ImageInsert, plugins.ImageBlock, plugins.ImageInline,
        plugins.ImageCaption, plugins.ImageResize, plugins.ImageStyle, plugins.ImageToolbar,
        plugins.MediaEmbed,
        plugins.Table, plugins.TableToolbar, plugins.TableCaption,
        plugins.TableProperties, plugins.TableCellProperties, plugins.TableColumnResize,
        plugins.Undo,
        plugins.RemoveFormat,
        plugins.FindAndReplace,
        plugins.SourceEditing,
        plugins.GeneralHtmlSupport,
        plugins.HtmlEmbed,
        plugins.Highlight,
        plugins.SpecialCharacters, plugins.SpecialCharactersEssentials,
        plugins.PageBreak,
        plugins.ShowBlocks,
        plugins.SelectAll,
        plugins.TextTransformation,
        plugins.AutoFormat,
        plugins.PasteFromOffice,
    ];

    const miniPlugins = [
        plugins.Essentials,
        plugins.Paragraph,
        plugins.Bold, plugins.Italic, plugins.Strikethrough, plugins.Underline,
        plugins.Link, plugins.AutoLink,
        plugins.List,
        plugins.Undo,
        plugins.RemoveFormat,
        plugins.TextTransformation,
        plugins.PasteFromOffice,
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const editorConfig: any = {
        licenseKey: "GPL",
        placeholder: placeholder || "Nhập nội dung...",
        plugins: isFull ? fullPlugins : miniPlugins,
        toolbar: isFull ? FULL_TOOLBAR : MINI_TOOLBAR,
    };

    // Full variant extras
    if (isFull) {
        editorConfig.image = {
            toolbar: [
                "imageTextAlternative",
                "toggleImageCaption",
                "|",
                "imageStyle:inline",
                "imageStyle:block",
                "imageStyle:side",
                "|",
                "resizeImage",
            ],
            upload: {
                types: ["jpeg", "png", "gif", "webp", "svg+xml"],
            },
        };
        editorConfig.table = {
            contentToolbar: [
                "tableColumn", "tableRow", "mergeTableCells",
                "|",
                "tableProperties", "tableCellProperties",
            ],
        };
        editorConfig.mediaEmbed = {
            previewsInData: true,
        };
        editorConfig.heading = {
            options: [
                { model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
                { model: "heading1", view: "h1", title: "Heading 1", class: "ck-heading_heading1" },
                { model: "heading2", view: "h2", title: "Heading 2", class: "ck-heading_heading2" },
                { model: "heading3", view: "h3", title: "Heading 3", class: "ck-heading_heading3" },
                { model: "heading4", view: "h4", title: "Heading 4", class: "ck-heading_heading4" },
            ],
        };
        editorConfig.fontSize = {
            options: [10, 12, 14, "default", 18, 20, 24, 28, 32, 36],
        };
        editorConfig.fontFamily = {
            options: [
                "default",
                "Arial, Helvetica, sans-serif",
                "Georgia, serif",
                "Times New Roman, Times, serif",
                "Courier New, Courier, monospace",
                "Verdana, Geneva, sans-serif",
                "Tahoma, Geneva, sans-serif",
            ],
        };
        editorConfig.codeBlock = {
            languages: [
                { language: "plaintext", label: "Plain text" },
                { language: "javascript", label: "JavaScript" },
                { language: "typescript", label: "TypeScript" },
                { language: "python", label: "Python" },
                { language: "html", label: "HTML" },
                { language: "css", label: "CSS" },
                { language: "php", label: "PHP" },
                { language: "sql", label: "SQL" },
                { language: "json", label: "JSON" },
                { language: "bash", label: "Bash" },
            ],
        };
        editorConfig.htmlSupport = {
            allow: [
                { name: /.*/, attributes: true, classes: true, styles: true },
            ],
        };
    }

    return (
        <CKEditorComponent
            editor={ClassicEditor}
            data={value}
            config={editorConfig}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onReady={(editor: any) => {
                // Custom upload adapter for image upload
                if (isFull) {
                    editor.plugins.get("FileRepository").createUploadAdapter = (loader: { file: Promise<File> }) => {
                        return new CustomUploadAdapter(loader);
                    };
                }
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(_event: any, editor: any) => {
                const data = editor.getData();
                onChange(data);
            }}
        />
    );
}

// Custom Upload Adapter (inline to avoid additional file import issues with dynamic loading)
class CustomUploadAdapter {
    private loader: { file: Promise<File> };
    private xhr?: XMLHttpRequest;

    constructor(loader: { file: Promise<File> }) {
        this.loader = loader;
    }

    upload(): Promise<{ default: string }> {
        return this.loader.file.then(
            (file) =>
                new Promise((resolve, reject) => {
                    const formData = new FormData();
                    formData.append("file", file);
                    formData.append("folder", "images");

                    this.xhr = new XMLHttpRequest();
                    this.xhr.open("POST", "/api/admin/upload", true);

                    this.xhr.onload = () => {
                        if (!this.xhr) return reject("Upload failed");

                        if (this.xhr.status >= 200 && this.xhr.status < 300) {
                            try {
                                const response = JSON.parse(this.xhr.responseText);
                                if (response.data?.url) {
                                    resolve({ default: response.data.url });
                                } else {
                                    reject("Invalid upload response");
                                }
                            } catch {
                                reject("Failed to parse upload response");
                            }
                        } else {
                            reject(`Upload failed with status ${this.xhr.status}`);
                        }
                    };

                    this.xhr.onerror = () => reject("Upload request failed");
                    this.xhr.send(formData);
                })
        );
    }

    abort(): void {
        if (this.xhr) {
            this.xhr.abort();
        }
    }
}
