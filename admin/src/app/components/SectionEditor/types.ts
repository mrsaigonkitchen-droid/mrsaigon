import type { Section, SectionKind } from '../../types';

export interface SectionEditorProps {
  section: Section | null;
  kind: SectionKind;
  onSave: (data: unknown, syncAll?: boolean) => void | Promise<void>;
  onCancel: () => void;
}

export interface FormFieldsProps {
  data: Record<string, unknown>;
  updateField: (path: string, value: unknown) => void;
  addArrayItem: (path: string, item: unknown) => void;
  removeArrayItem: (path: string, index: number) => void;
  onImagePick: (field: string) => void;
}

export interface PreviewProps {
  data: Record<string, unknown>;
}

export type { Section, SectionKind };
