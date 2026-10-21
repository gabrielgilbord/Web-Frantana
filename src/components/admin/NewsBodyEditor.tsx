"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value.trim());
}

function toEditorHtml(value: string) {
  const v = value.trim();
  if (!v) return "";
  if (looksLikeHtml(v)) return v;
  return v
    .split(/\n{2,}/)
    .map((block) => {
      const lines = block
        .split(/\n/)
        .map((line) =>
          line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        )
        .join("<br>");
      return `<p>${lines}</p>`;
    })
    .join("");
}

export function NewsBodyEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Placeholder.configure({
        placeholder:
          placeholder ??
          "Escribe la novedad… Usa la barra para títulos, listas y formato.",
      }),
    ],
    content: toEditorHtml(value),
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "news-editor__prose",
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = toEditorHtml(value);
    if (next && next !== current && !editor.isFocused) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) {
    return <div className="news-editor news-editor--loading">Cargando editor…</div>;
  }

  function setLink() {
    const prev = editor?.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL del enlace", prev ?? "https://");
    if (url === null) return;
    if (!url.trim()) {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      ?.chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim() })
      .run();
  }

  return (
    <div className="news-editor">
      <div className="news-editor__bar" role="toolbar" aria-label="Formato">
        <button
          type="button"
          className={editor.isActive("bold") ? "is-active" : undefined}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Negrita"
        >
          B
        </button>
        <button
          type="button"
          className={editor.isActive("italic") ? "is-active" : undefined}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Cursiva"
        >
          I
        </button>
        <button
          type="button"
          className={editor.isActive("underline") ? "is-active" : undefined}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Subrayado"
        >
          U
        </button>
        <button
          type="button"
          className={editor.isActive("strike") ? "is-active" : undefined}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Tachado"
        >
          S
        </button>
        <span className="news-editor__sep" />
        <button
          type="button"
          className={
            editor.isActive("heading", { level: 1 }) ? "is-active" : undefined
          }
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          title="Título H1"
        >
          H1
        </button>
        <button
          type="button"
          className={
            editor.isActive("heading", { level: 2 }) ? "is-active" : undefined
          }
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          title="Título H2"
        >
          H2
        </button>
        <button
          type="button"
          className={
            editor.isActive("heading", { level: 3 }) ? "is-active" : undefined
          }
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          title="Título H3"
        >
          H3
        </button>
        <span className="news-editor__sep" />
        <button
          type="button"
          className={editor.isActive("bulletList") ? "is-active" : undefined}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Lista"
        >
          • Lista
        </button>
        <button
          type="button"
          className={editor.isActive("orderedList") ? "is-active" : undefined}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Lista numerada"
        >
          1. Lista
        </button>
        <button
          type="button"
          className={editor.isActive("blockquote") ? "is-active" : undefined}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Cita"
        >
          Cita
        </button>
        <button
          type="button"
          className={editor.isActive("link") ? "is-active" : undefined}
          onClick={setLink}
          title="Enlace"
        >
          Enlace
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Línea"
        >
          —
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
