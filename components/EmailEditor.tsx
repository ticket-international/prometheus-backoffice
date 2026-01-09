'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiImage,
  FiLink,
  FiList,
  FiType,
} from 'react-icons/fi';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EmailEditorProps {
  value: string;
  onChange: (content: string) => void;
}

export default function EmailEditor({ value, onChange }: EmailEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  useEffect(() => {
    if (editorRef.current && value && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertImage = () => {
    if (imageUrl) {
      executeCommand('insertImage', imageUrl);
      setImageUrl('');
      setShowImageDialog(false);
    }
  };

  const insertLink = () => {
    if (linkUrl) {
      if (linkText) {
        const html = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
        document.execCommand('insertHTML', false, html);
      } else {
        executeCommand('createLink', linkUrl);
      }
      setLinkUrl('');
      setLinkText('');
      setShowLinkDialog(false);
      updateContent();
    }
  };

  const setFontSize = (size: string) => {
    executeCommand('fontSize', size);
  };

  const setHeading = (level: string) => {
    executeCommand('formatBlock', level);
  };

  return (
    <div className="space-y-4">
      <Card className="p-2">
        <div className="flex flex-wrap gap-1">
          <Select onValueChange={setHeading}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="p">Normal</SelectItem>
              <SelectItem value="h1">Überschrift 1</SelectItem>
              <SelectItem value="h2">Überschrift 2</SelectItem>
              <SelectItem value="h3">Überschrift 3</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={setFontSize}>
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Größe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Klein</SelectItem>
              <SelectItem value="3">Normal</SelectItem>
              <SelectItem value="5">Groß</SelectItem>
              <SelectItem value="7">Sehr groß</SelectItem>
            </SelectContent>
          </Select>

          <div className="h-8 w-px bg-border mx-1" />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('bold')}
            title="Fett"
          >
            <FiBold size={16} />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('italic')}
            title="Kursiv"
          >
            <FiItalic size={16} />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('underline')}
            title="Unterstrichen"
          >
            <FiUnderline size={16} />
          </Button>

          <div className="h-8 w-px bg-border mx-1" />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('justifyLeft')}
            title="Linksbündig"
          >
            <FiAlignLeft size={16} />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('justifyCenter')}
            title="Zentriert"
          >
            <FiAlignCenter size={16} />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('justifyRight')}
            title="Rechtsbündig"
          >
            <FiAlignRight size={16} />
          </Button>

          <div className="h-8 w-px bg-border mx-1" />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand('insertUnorderedList')}
            title="Aufzählung"
          >
            <FiList size={16} />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowLinkDialog(true)}
            title="Link einfügen"
          >
            <FiLink size={16} />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowImageDialog(true)}
            title="Bild einfügen"
          >
            <FiImage size={16} />
          </Button>
        </div>
      </Card>

      {showImageDialog && (
        <Card className="p-4">
          <div className="space-y-3">
            <Label htmlFor="imageUrl">Bild-URL eingeben</Label>
            <div className="flex gap-2">
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && insertImage()}
              />
              <Button type="button" onClick={insertImage}>
                Einfügen
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowImageDialog(false);
                  setImageUrl('');
                }}
              >
                Abbrechen
              </Button>
            </div>
          </div>
        </Card>
      )}

      {showLinkDialog && (
        <Card className="p-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="linkText">Link-Text (optional)</Label>
              <Input
                id="linkText"
                type="text"
                placeholder="Klicken Sie hier"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkUrl">Link-URL</Label>
              <div className="flex gap-2">
                <Input
                  id="linkUrl"
                  type="url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && insertLink()}
                />
                <Button type="button" onClick={insertLink}>
                  Einfügen
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowLinkDialog(false);
                    setLinkUrl('');
                    setLinkText('');
                  }}
                >
                  Abbrechen
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-4 min-h-[400px]">
        <div
          ref={editorRef}
          contentEditable
          className="min-h-[350px] outline-none prose prose-sm max-w-none"
          onInput={updateContent}
          onBlur={updateContent}
          style={{
            padding: '1rem',
            lineHeight: '1.6',
          }}
        />
      </Card>
    </div>
  );
}
