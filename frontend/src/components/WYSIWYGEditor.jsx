import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useTranslation } from 'react-i18next';

const WYSIWYGEditor = ({ 
  value, 
  onChange, 
  placeholder = 'Start writing...',
  readOnly = false,
  height = '300px',
  showToolbar = true
}) => {
  const { t } = useTranslation();
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: value || '',
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
  });

  // Keep editor content in sync with value prop
  const initialValue = useRef(value);
  useEffect(() => {
    if (editor && value !== initialValue.current) {
      editor.commands.setContent(value || '');
      initialValue.current = value;
    }
  }, [value, editor]);

  return (
    <div className="wysiwyg-editor">
      {showToolbar && (
        <div className="mb-2 flex flex-wrap gap-2">
          <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor} className={editor?.isActive('bold') ? 'font-bold text-blue-600' : ''}>B</button>
          <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor} className={editor?.isActive('italic') ? 'italic text-blue-600' : ''}>I</button>
          <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} disabled={!editor} className={editor?.isActive('strike') ? 'line-through text-blue-600' : ''}>S</button>
          <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} disabled={!editor}>• List</button>
          <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} disabled={!editor}>1. List</button>
          <button type="button" onClick={() => editor.chain().focus().setParagraph().run()} disabled={!editor}>P</button>
          <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} disabled={!editor}>H1</button>
          <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} disabled={!editor}>H2</button>
          <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} disabled={!editor}>H3</button>
        </div>
      )}
      <div style={{ minHeight: height, border: '1px solid #d1d5db', borderRadius: '0.5rem', background: 'white', padding: '0.5rem' }}>
        <EditorContent editor={editor} placeholder={placeholder} />
      </div>
      <style jsx>{`
        .wysiwyg-editor .ProseMirror {
          min-height: ${height};
          outline: none;
          color: inherit;
        }
        .wysiwyg-editor .ProseMirror[contenteditable="false"] {
          background: #f3f4f6;
        }
      `}</style>
    </div>
  );
};

export default WYSIWYGEditor; 