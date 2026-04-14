/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 12 / 03 / 2026
 * Versión: 3.0
 *
 * Descripción:
 * Modal para crear y editar términos y condiciones del módulo
 * Débitos Automáticos.
 *
 * Permite gestionar:
 * - versión
 * - título
 * - contenido_html (generado automáticamente desde bloques)
 * - activo
 * - publicado_desde
 * - publicado_hasta
 *
 * Tema: Frontend - Débitos Automáticos - Términos
 * Capa: Frontend
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  FileText,
  Hash,
  BadgeCheck,
  CalendarDays,
  ShieldCheck,
  Type,
  Eye,
  AlertTriangle,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  LayoutTemplate,
  StickyNote,
  List,
  AlignLeft,
  Bold,
  Italic,
  Underline
} from 'lucide-react';

const backdropV = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const panelV = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.22 }
  },
  exit: {
    opacity: 0,
    y: 18,
    scale: 0.98,
    transition: { duration: 0.18 }
  }
};

/* Benjamin Orellana - 2026/04/13 - Tipos de bloques soportados por el constructor visual. */
const BLOCK_TYPES = {
  TITLE: 'titulo',
  PARAGRAPH: 'parrafo',
  SECTION: 'seccion',
  NOTE: 'nota',
  LIST: 'lista'
};

/* Benjamin Orellana - 2026/04/13 - Tokens internos para soportar formato inline sin exponer HTML al usuario. */
const INLINE_TOKENS = {
  bold: { open: '**', close: '**' },
  italic: { open: '//', close: '//' },
  underline: { open: '__', close: '__' }
};

/* Benjamin Orellana - 2026/04/13 - Convierte texto del editor a HTML con soporte de negrita, cursiva y subrayado. */
const formatRichTextToHtml = (value = '') => {
  let html = escapeHtml(String(value || ''));

  html = html.replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\/\/([\s\S]+?)\/\//g, '<em>$1</em>');
  html = html.replace(/__([\s\S]+?)__/g, '<u>$1</u>');
  html = html.replace(/\n/g, '<br />');

  return html;
};

/* Benjamin Orellana - 2026/04/13 - Reconstruye texto editable a partir de nodos HTML preservando formato inline. */
const getRichTextFromNode = (node) => {
  if (!node) return '';

  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || '';
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }

  const tag = String(node.tagName || '').toLowerCase();

  if (tag === 'br') {
    return '\n';
  }

  const childrenText = Array.from(node.childNodes || [])
    .map((child) => getRichTextFromNode(child))
    .join('');

  if (tag === 'strong' || tag === 'b') {
    return `**${childrenText}**`;
  }

  if (tag === 'em' || tag === 'i') {
    return `//${childrenText}//`;
  }

  if (tag === 'u') {
    return `__${childrenText}__`;
  }

  return childrenText;
};

/* Benjamin Orellana - 2026/04/13 - Genera ids únicos para los bloques del documento. */
const createBlockId = () =>
  `bloque_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

/* Benjamin Orellana - 2026/04/13 - Crea un bloque base según el tipo. */
const createBlock = (tipo = BLOCK_TYPES.PARAGRAPH) => {
  switch (tipo) {
    case BLOCK_TYPES.TITLE:
      return {
        id: createBlockId(),
        tipo,
        titulo: '',
        texto: ''
      };

    case BLOCK_TYPES.SECTION:
      return {
        id: createBlockId(),
        tipo,
        titulo: '',
        texto: ''
      };

    case BLOCK_TYPES.NOTE:
      return {
        id: createBlockId(),
        tipo,
        titulo: '',
        texto: ''
      };

    case BLOCK_TYPES.LIST:
      return {
        id: createBlockId(),
        tipo,
        titulo: '',
        texto: ''
      };

    case BLOCK_TYPES.PARAGRAPH:
    default:
      return {
        id: createBlockId(),
        tipo: BLOCK_TYPES.PARAGRAPH,
        titulo: '',
        texto: ''
      };
  }
};

/* Benjamin Orellana - 2026/04/13 - Estructura inicial amigable para nuevos documentos. */
const createDefaultBlocks = (fallbackTitle = '') => [
  {
    ...createBlock(BLOCK_TYPES.TITLE),
    titulo:
      fallbackTitle ||
      'Carta de aceptación del cliente al servicio de débito automático'
  },
  {
    ...createBlock(BLOCK_TYPES.PARAGRAPH),
    texto:
      'En mi carácter de titular de la tarjeta de crédito cargada, autorizo expresamente a que el pago correspondiente a las cuotas mensuales derivadas de la contratación del servicio ofrecido por HAMMERX S.A.S., sea debitado en forma directa y automática en mi resumen de cuenta y/o en los vencimientos correspondientes.'
  }
];

/* Benjamin Orellana - 2026/04/13 - Escapa HTML para evitar que el contenido editable rompa el documento final. */
const escapeHtml = (value = '') =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

/* Benjamin Orellana - 2026/04/13 - Convierte saltos de línea a <br /> para mantener legibilidad. */
const formatTextToHtml = (value = '') =>
  escapeHtml(value).replace(/\n/g, '<br />');

/* Benjamin Orellana - 2026/04/13 - Determina si un bloque tiene contenido real. */
const blockHasContent = (block) => {
  const titulo = String(block?.titulo || '').trim();
  const texto = String(block?.texto || '').trim();
  return Boolean(titulo || texto);
};

/* Benjamin Orellana - 2026/04/13 - Filtra solo bloques útiles para persistencia y preview. */
const getMeaningfulBlocks = (blocks = []) =>
  (Array.isArray(blocks) ? blocks : []).filter(blockHasContent);

/* Benjamin Orellana - 2026/04/13 - Normaliza texto plano. */
const normalizeText = (value = '') =>
  String(value || '')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

/* Benjamin Orellana - 2026/04/13 - Extrae texto preservando saltos de línea y formato inline desde HTML existente. */
const getNodeTextPreservingBreaks = (node) => {
  return normalizeText(getRichTextFromNode(node));
};

/* Benjamin Orellana - 2026/04/13 - Detecta si un fragmento parece un título/subtítulo corto. */
const looksLikeHeadingCandidate = (value = '') => {
  const text = normalizeText(value);

  if (!text) return false;
  if (text.length < 3 || text.length > 90) return false;
  if (/[.:;!?]$/.test(text)) return false;
  if (text.includes('@')) return false;

  const words = text.split(/\s+/).filter(Boolean);
  if (words.length > 10) return false;

  const firstChar = text.charAt(0);
  return firstChar === firstChar.toUpperCase();
};

/* Benjamin Orellana - 2026/04/13 - Intenta reconstruir bloques cuando un HTML viejo quedó aplanado dentro de un solo párrafo. */
const explodeFlatParagraphIntoBlocks = (text = '') => {
  const normalized = String(text || '')
    .replace(/\u00a0/g, ' ')
    .trim();

  if (!normalized) return [];

  const chunks = normalized
    .split(/(?:\n\s*\n|\s{2,})/)
    .map((item) => normalizeText(item))
    .filter(Boolean);

  if (chunks.length < 3) {
    return [
      {
        ...createBlock(BLOCK_TYPES.PARAGRAPH),
        texto: normalized
      }
    ];
  }

  const rebuilt = [];

  for (let i = 0; i < chunks.length; i += 1) {
    const current = chunks[i];
    const next = chunks[i + 1];

    if (
      looksLikeHeadingCandidate(current) &&
      next &&
      !looksLikeHeadingCandidate(next)
    ) {
      rebuilt.push({
        ...createBlock(BLOCK_TYPES.SECTION),
        titulo: current,
        texto: next
      });
      i += 1;
      continue;
    }

    rebuilt.push({
      ...createBlock(BLOCK_TYPES.PARAGRAPH),
      texto: current
    });
  }

  return rebuilt.length
    ? rebuilt
    : [
        {
          ...createBlock(BLOCK_TYPES.PARAGRAPH),
          texto: normalized
        }
      ];
};

/* Benjamin Orellana - 2026/04/13 - Construye el HTML final con una presentación más profesional y con data attributes para re-edición robusta. */
const buildHtmlFromBlocks = (blocks = []) => {
  const normalizedBlocks = getMeaningfulBlocks(blocks);

  if (!normalizedBlocks.length) return '';

  const html = normalizedBlocks
    .map((block) => {
      const titulo = String(block?.titulo || '').trim();
      const texto = String(block?.texto || '').trim();

      switch (block?.tipo) {
        case BLOCK_TYPES.TITLE:
          return `
            <div data-da-block="title" style="margin-bottom: 26px;">
              <h1 style="margin: 0; padding-bottom: 18px; border-bottom: 1px solid #e2e8f0; font-size: 34px; line-height: 1.18; font-weight: 800; letter-spacing: -0.03em; color: #0f172a;">
                ${formatRichTextToHtml(titulo)}
              </h1>
            </div>
          `;

        case BLOCK_TYPES.SECTION:
          return `
            <div data-da-block="section" style="margin: 30px 0 0;">
              <h2 style="margin: 0 0 12px; padding-left: 12px; border-left: 4px solid #f97316; font-size: 21px; line-height: 1.3; font-weight: 800; color: #0f172a;">
                ${formatRichTextToHtml(titulo)}
              </h2>
              <p style="margin: 0; font-size: 16px; line-height: 1.9; color: #334155;">
                ${formatRichTextToHtml(texto)}
              </p>
            </div>
          `;

        case BLOCK_TYPES.NOTE:
          return `
            <div data-da-block="note" style="margin: 22px 0; padding: 16px 18px; border: 1px solid #fdba74; background: linear-gradient(180deg, #fff7ed 0%, #fffbf5 100%); border-radius: 18px; box-shadow: 0 10px 28px rgba(249, 115, 22, 0.08);">
              ${
                titulo
                  ? `
                    <p style="margin: 0 0 8px; font-size: 14px; line-height: 1.5; font-weight: 800; letter-spacing: 0.02em; text-transform: uppercase; color: #9a3412;">
                      ${formatRichTextToHtml(titulo)}
                    </p>
                  `
                  : ''
              }
              <p style="margin: 0; font-size: 15px; line-height: 1.8; color: #7c2d12;">
                ${formatRichTextToHtml(texto)}
              </p>
            </div>
          `;

        case BLOCK_TYPES.LIST: {
          const items = texto
            .split('\n')
            .map((item) => normalizeText(item))
            .filter(Boolean);

          return `
            <div data-da-block="list" style="margin: 28px 0 0;">
              ${
                titulo
                  ? `
                    <h2 style="margin: 0 0 12px; padding-left: 12px; border-left: 4px solid #f97316; font-size: 21px; line-height: 1.3; font-weight: 800; color: #0f172a;">
                      ${formatRichTextToHtml(titulo)}
                    </h2>
                  `
                  : ''
              }
              <ul style="margin: 0; padding-left: 22px; color: #334155; font-size: 16px; line-height: 1.9;">
                ${items
                  .map(
                    (item) => `
                      <li style="margin-bottom: 8px;">
                        ${formatRichTextToHtml(item)}
                      </li>
                    `
                  )
                  .join('')}
              </ul>
            </div>
          `;
        }

        case BLOCK_TYPES.PARAGRAPH:
        default:
          return `
            <div data-da-block="paragraph" style="margin: 0 0 18px;">
              <p style="margin: 0; font-size: 16px; line-height: 1.9; color: #334155;">
                ${formatRichTextToHtml(texto)}
              </p>
            </div>
          `;
      }
    })
    .join('\n');

  return `
    <div style="font-family: inherit; color: #334155; background: linear-gradient(180deg, #ffffff 0%, #fffaf5 100%); border: 1px solid #fde7cf; border-radius: 26px; padding: 30px 28px; line-height: 1.8; box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);">
      ${html}
    </div>
  `.trim();
};

/* Benjamin Orellana - 2026/04/13 - Extrae bloques cuando el HTML ya fue generado por este mismo constructor. */
const parseGeneratedBlocks = (doc) => {
  const blockNodes = Array.from(doc.querySelectorAll('[data-da-block]'));

  if (!blockNodes.length) return [];

  return blockNodes
    .map((node) => {
      const type = node.getAttribute('data-da-block');

      if (type === 'title') {
        return {
          ...createBlock(BLOCK_TYPES.TITLE),
          titulo: normalizeText(getRichTextFromNode(node))
        };
      }

      if (type === 'paragraph') {
        const p = node.querySelector('p');
        return {
          ...createBlock(BLOCK_TYPES.PARAGRAPH),
          texto: getNodeTextPreservingBreaks(p || node)
        };
      }

      if (type === 'section') {
        const h2 = node.querySelector('h2');
        const p = node.querySelector('p');

        return {
          ...createBlock(BLOCK_TYPES.SECTION),
          titulo: normalizeText(h2?.textContent || ''),
          texto: getNodeTextPreservingBreaks(p || node)
        };
      }

      if (type === 'note') {
        const paragraphs = Array.from(node.querySelectorAll('p'));

        return {
          ...createBlock(BLOCK_TYPES.NOTE),
          titulo: normalizeText(getRichTextFromNode(paragraphs?.[0] || null)),
          texto: getNodeTextPreservingBreaks(paragraphs?.[1] || node)
        };
      }

      if (type === 'list') {
        const h2 = node.querySelector('h2');
        const items = Array.from(node.querySelectorAll('li')).map((li) =>
          normalizeText(getRichTextFromNode(li))
        );
        return {
          ...createBlock(BLOCK_TYPES.LIST),
          titulo: normalizeText(getRichTextFromNode(h2 || null)),

          texto: items
        };
      }

      return null;
    })
    .filter(Boolean)
    .filter(blockHasContent);
};

/* Benjamin Orellana - 2026/04/13 - Convierte HTML legado a bloques editables sin perder jerarquía visual. */
const htmlToBlocks = (html = '', fallbackTitle = '') => {
  const raw = String(html || '').trim();

  if (!raw) return createDefaultBlocks(fallbackTitle);

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(raw, 'text/html');

    const generatedBlocks = parseGeneratedBlocks(doc);
    if (generatedBlocks.length) {
      return generatedBlocks;
    }

    const blocks = [];

    const pushParagraph = (text) => {
      const normalized = normalizeText(text);
      if (!normalized) return;

      const previous = blocks[blocks.length - 1];
      if (
        previous?.tipo === BLOCK_TYPES.SECTION &&
        !String(previous?.texto || '').trim()
      ) {
        previous.texto = normalized;
        return;
      }

      blocks.push({
        ...createBlock(BLOCK_TYPES.PARAGRAPH),
        texto: normalized
      });
    };

    const pushBlock = (block) => {
      if (!blockHasContent(block)) return;

      if (block.tipo === BLOCK_TYPES.PARAGRAPH) {
        pushParagraph(block.texto);
        return;
      }

      blocks.push(block);
    };

    const processNode = (node) => {
      if (!node) return;

      if (node.nodeType === Node.TEXT_NODE) {
        const text = normalizeText(node.textContent || '');
        if (text) {
          pushParagraph(text);
        }
        return;
      }

      if (node.nodeType !== Node.ELEMENT_NODE) return;

      const tag = String(node.tagName || '').toLowerCase();

      if (tag === 'h1') {
        pushBlock({
          ...createBlock(BLOCK_TYPES.TITLE),
          titulo: normalizeText(node.textContent || '')
        });
        return;
      }

      if (tag === 'h2') {
        pushBlock({
          ...createBlock(BLOCK_TYPES.SECTION),
          titulo: normalizeText(node.textContent || ''),
          texto: ''
        });
        return;
      }

      if (tag === 'ul' || tag === 'ol') {
        const items = Array.from(node.querySelectorAll('li'))
          .map((li) => normalizeText(li.textContent || ''))
          .filter(Boolean)
          .join('\n');

        pushBlock({
          ...createBlock(BLOCK_TYPES.LIST),
          titulo: '',
          texto: items
        });
        return;
      }

      if (tag === 'p') {
        const text = getNodeTextPreservingBreaks(node);
        const explodedBlocks = explodeFlatParagraphIntoBlocks(text);

        explodedBlocks.forEach((block) => pushBlock(block));
        return;
      }

      if (tag === 'div' || tag === 'section' || tag === 'article') {
        const children = Array.from(node.childNodes || []);

        if (!children.length) {
          const text = normalizeText(node.textContent || '');
          if (text) pushParagraph(text);
          return;
        }

        children.forEach((child) => processNode(child));
        return;
      }

      const text = normalizeText(node.textContent || '');
      if (text) {
        pushParagraph(text);
      }
    };

    const rootChildren =
      doc.body?.children?.length === 1 &&
      String(doc.body.firstElementChild?.tagName || '').toLowerCase() === 'div'
        ? Array.from(doc.body.firstElementChild.childNodes || [])
        : Array.from(doc.body.childNodes || []);

    rootChildren.forEach((node) => processNode(node));

    const meaningful = getMeaningfulBlocks(blocks);
    return meaningful.length ? meaningful : createDefaultBlocks(fallbackTitle);
  } catch (error) {
    console.error('No se pudo convertir HTML legado a bloques:', error);
    return createDefaultBlocks(fallbackTitle);
  }
};

const formatDateTimeLocal = (value) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const pad = (num) => String(num).padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const toNullableDate = (value) => {
  if (!value || !String(value).trim()) return null;
  return String(value).trim();
};

const emptyForm = {
  version: '',
  titulo: '',
  bloques: createDefaultBlocks(''),
  activo: true,
  publicado_desde: '',
  publicado_hasta: ''
};

const validateForm = (form) => {
  if (!String(form.version || '').trim()) {
    return 'La versión es obligatoria.';
  }

  if (!String(form.titulo || '').trim()) {
    return 'El título es obligatorio.';
  }

  if (String(form.version || '').trim().length > 30) {
    return 'La versión no puede superar los 30 caracteres.';
  }

  if (String(form.titulo || '').trim().length > 150) {
    return 'El título no puede superar los 150 caracteres.';
  }

  if (!getMeaningfulBlocks(form.bloques).length) {
    return 'Debes cargar al menos un bloque con contenido.';
  }

  if (
    form.publicado_desde &&
    Number.isNaN(new Date(form.publicado_desde).getTime())
  ) {
    return 'Publicado desde es inválido.';
  }

  if (
    form.publicado_hasta &&
    Number.isNaN(new Date(form.publicado_hasta).getTime())
  ) {
    return 'Publicado hasta es inválido.';
  }

  if (
    form.publicado_desde &&
    form.publicado_hasta &&
    new Date(form.publicado_desde) > new Date(form.publicado_hasta)
  ) {
    return 'Publicado desde no puede ser mayor a publicado hasta.';
  }

  return '';
};

const getPayloadFromForm = (form) => {
  return {
    version: String(form.version || '').trim(),
    titulo: String(form.titulo || '').trim(),
    contenido_html: buildHtmlFromBlocks(form.bloques),
    activo: form.activo ? 1 : 0,
    publicado_desde: toNullableDate(form.publicado_desde),
    publicado_hasta: toNullableDate(form.publicado_hasta)
  };
};

const inputClass =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100';

const iconByType = {
  [BLOCK_TYPES.TITLE]: LayoutTemplate,
  [BLOCK_TYPES.PARAGRAPH]: AlignLeft,
  [BLOCK_TYPES.SECTION]: FileText,
  [BLOCK_TYPES.NOTE]: StickyNote,
  [BLOCK_TYPES.LIST]: List
};

export default function TerminosFormModal({
  open,
  onClose,
  onSubmit,
  initial
}) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  /* Benjamin Orellana - 2026/04/13 - Referencias a textareas para aplicar formato inline sobre el texto seleccionado. */
  const textareasRef = useRef({});
  /* Benjamin Orellana - 2026/04/13 - Guarda la selección actual de cada textarea para evitar que se pierda al usar la barra de formato. */
  const selectionsRef = useRef({});
  const isEdit = !!initial?.id;
  const titleId = 'debito-terminos-form-title';

  /* Benjamin Orellana - 2026/04/13 - Hidrata el formulario convirtiendo HTML existente a bloques editables. */
  useEffect(() => {
    if (!open) return;

    setSaving(false);
    setErrorMsg('');
    setPreviewMode(false);

    const bloquesIniciales = initial?.contenido_html
      ? htmlToBlocks(initial.contenido_html, initial?.titulo || '')
      : createDefaultBlocks(initial?.titulo || '');

    setForm({
      version: initial?.version || '',
      titulo: initial?.titulo || '',
      bloques: bloquesIniciales,
      activo:
        initial?.activo === 1 ||
        initial?.activo === true ||
        initial?.activo === '1',
      publicado_desde: formatDateTimeLocal(initial?.publicado_desde),
      publicado_hasta: formatDateTimeLocal(initial?.publicado_hasta)
    });
  }, [open, initial]);

  const previewHtml = useMemo(() => {
    return buildHtmlFromBlocks(form.bloques);
  }, [form.bloques]);

  const bloquesConContenido = useMemo(() => {
    return getMeaningfulBlocks(form.bloques);
  }, [form.bloques]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  /* Benjamin Orellana - 2026/04/13 - Actualiza un campo específico de un bloque. */
  const handleBlockChange = (blockId, field, value) => {
    setForm((prev) => ({
      ...prev,
      bloques: prev.bloques.map((block) =>
        block.id === blockId
          ? {
              ...block,
              [field]: value
            }
          : block
      )
    }));
  };

  /* Benjamin Orellana - 2026/04/13 - Registra refs de textareas por bloque para aplicar formato inline. */
  const setTextareaRef = (blockId, element) => {
    if (!element) return;
    textareasRef.current[blockId] = element;
  };

  /* Benjamin Orellana - 2026/04/13 - Memoriza inicio y fin de selección del textarea por bloque. */
  const rememberSelection = (blockId) => {
    const textarea = textareasRef.current[blockId];
    if (!textarea) return;

    selectionsRef.current[blockId] = {
      start: textarea.selectionStart ?? 0,
      end: textarea.selectionEnd ?? 0
    };
  };

  /* Benjamin Orellana - 2026/04/13 - Restaura foco y selección del textarea sin hacer saltar la UI. */
  const restoreSelection = (blockId, start, end) => {
    requestAnimationFrame(() => {
      const textarea = textareasRef.current[blockId];
      if (!textarea) return;

      textarea.focus({ preventScroll: true });
      textarea.setSelectionRange(start, end);

      selectionsRef.current[blockId] = {
        start,
        end
      };
    });
  };

  /* Benjamin Orellana - 2026/04/13 - Aplica formato inline preservando selección y foco del textarea. */
  const applyInlineFormat = (blockId, formatType) => {
    const textarea = textareasRef.current[blockId];
    const tokens = INLINE_TOKENS[formatType];

    if (!textarea || !tokens) return;

    const savedSelection = selectionsRef.current[blockId] || {
      start: textarea.selectionStart ?? 0,
      end: textarea.selectionEnd ?? 0
    };

    const selectionStart = savedSelection.start ?? 0;
    const selectionEnd = savedSelection.end ?? 0;

    let finalStart = selectionStart + tokens.open.length;
    let finalEnd = finalStart;

    setForm((prev) => {
      const bloques = prev.bloques.map((block) => {
        if (block.id !== blockId) return block;

        const currentText = String(block.texto || '');
        const selectedText =
          currentText.slice(selectionStart, selectionEnd) || 'texto';

        const nextText =
          currentText.slice(0, selectionStart) +
          tokens.open +
          selectedText +
          tokens.close +
          currentText.slice(selectionEnd);

        finalEnd = finalStart + selectedText.length;

        return {
          ...block,
          texto: nextText
        };
      });

      return {
        ...prev,
        bloques
      };
    });

    restoreSelection(blockId, finalStart, finalEnd);
  };

  /* Benjamin Orellana - 2026/04/13 - Cambia el tipo del bloque intentando conservar el contenido existente. */
  const handleBlockTypeChange = (blockId, newType) => {
    setForm((prev) => ({
      ...prev,
      bloques: prev.bloques.map((block) => {
        if (block.id !== blockId) return block;

        const nextBlock = createBlock(newType);

        return {
          ...nextBlock,
          id: block.id,
          titulo:
            newType === BLOCK_TYPES.TITLE ||
            newType === BLOCK_TYPES.SECTION ||
            newType === BLOCK_TYPES.NOTE ||
            newType === BLOCK_TYPES.LIST
              ? block.titulo || ''
              : '',
          texto: block.texto || ''
        };
      })
    }));
  };

  /* Benjamin Orellana - 2026/04/13 - Agrega un bloque al final o debajo del bloque seleccionado. */
  const handleAddBlock = (
    tipo = BLOCK_TYPES.PARAGRAPH,
    insertAfterIndex = null
  ) => {
    const newBlock = createBlock(tipo);

    setForm((prev) => {
      const bloques = [...prev.bloques];

      if (
        insertAfterIndex === null ||
        insertAfterIndex < 0 ||
        insertAfterIndex >= bloques.length
      ) {
        bloques.push(newBlock);
      } else {
        bloques.splice(insertAfterIndex + 1, 0, newBlock);
      }

      return {
        ...prev,
        bloques
      };
    });
  };

  /* Benjamin Orellana - 2026/04/13 - Elimina un bloque manteniendo siempre una base mínima para edición. */
  const handleDeleteBlock = (blockId) => {
    setForm((prev) => {
      const filtered = prev.bloques.filter((block) => block.id !== blockId);

      return {
        ...prev,
        bloques: filtered.length ? filtered : createDefaultBlocks(prev.titulo)
      };
    });
  };

  /* Benjamin Orellana - 2026/04/13 - Reordena bloques dentro del documento. */
  const handleMoveBlock = (blockId, direction) => {
    setForm((prev) => {
      const bloques = [...prev.bloques];
      const index = bloques.findIndex((block) => block.id === blockId);

      if (index === -1) return prev;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= bloques.length) return prev;

      const temp = bloques[index];
      bloques[index] = bloques[targetIndex];
      bloques[targetIndex] = temp;

      return {
        ...prev,
        bloques
      };
    });
  };

  const submit = async (e) => {
    e.preventDefault();

    const validationError = validateForm(form);
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    try {
      setSaving(true);
      setErrorMsg('');

      const payload = getPayloadFromForm(form);
      await onSubmit(payload);

      onClose();
    } catch (error) {
      const backendMessage =
        error?.response?.data?.mensajeError ||
        error?.response?.data?.message ||
        error?.message ||
        'No se pudo guardar el término.';

      setErrorMsg(backendMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4"
          variants={backdropV}
          initial="hidden"
          animate="visible"
          exit="exit"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <div
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
            onClick={onClose}
          />

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.08) 1px, transparent 1px)',
              backgroundSize: '34px 34px'
            }}
          />

          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -left-24 size-[24rem] rounded-full blur-3xl opacity-50"
            style={{
              background:
                'radial-gradient(circle, rgba(249,115,22,0.22) 0%, rgba(251,146,60,0.14) 35%, transparent 72%)'
            }}
          />

          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -right-20 size-[24rem] rounded-full blur-3xl opacity-45"
            style={{
              background:
                'radial-gradient(circle, rgba(251,191,36,0.18) 0%, rgba(253,186,116,0.12) 35%, transparent 72%)'
            }}
          />

          <motion.div
            variants={panelV}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-[98vw] sm:max-w-6xl max-h-[92vh] overflow-y-auto rounded-[28px] border border-orange-100 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.28)]"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative z-10 p-5 sm:p-6 md:p-7">
              <div className="mb-6 flex items-start gap-4 rounded-[24px] border border-orange-100 bg-gradient-to-r from-orange-50 via-white to-amber-50 p-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 ring-1 ring-orange-200">
                  <FileText className="h-7 w-7" />
                </div>

                <div className="pr-10">
                  <h3
                    id={titleId}
                    className="text-xl font-bignoodle sm:text-2xl font-bold tracking-tight text-slate-900"
                  >
                    {isEdit ? 'Editar términos' : 'Nuevos términos'}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    Gestiona la versión legal, vigencia y contenido del
                    documento sin necesidad de escribir HTML.
                  </p>
                </div>
              </div>

              {errorMsg && (
                <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={submit} className="space-y-6">
                <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <BadgeCheck className="h-5 w-5 text-orange-500" />
                    <h4 className="text-base font-bold text-slate-900">
                      Datos principales
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Hash className="h-4 w-4 text-orange-500" />
                        Versión <span className="text-rose-500">*</span>
                      </label>
                      <input
                        name="version"
                        value={form.version}
                        onChange={handleChange}
                        placeholder="Ej: v1.0"
                        maxLength={30}
                        className={inputClass}
                      />
                    </div>

                    <div className="xl:col-span-2">
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Type className="h-4 w-4 text-orange-500" />
                        Título <span className="text-rose-500">*</span>
                      </label>
                      <input
                        name="titulo"
                        value={form.titulo}
                        onChange={handleChange}
                        placeholder="Ej: Términos y Condiciones - Débitos Automáticos"
                        maxLength={150}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-3">
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <CalendarDays className="h-4 w-4 text-orange-500" />
                        Publicado desde
                      </label>
                      <input
                        type="datetime-local"
                        name="publicado_desde"
                        value={form.publicado_desde}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <CalendarDays className="h-4 w-4 text-orange-500" />
                        Publicado hasta
                      </label>
                      <input
                        type="datetime-local"
                        name="publicado_hasta"
                        value={form.publicado_hasta}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>

                    <div className="flex items-end">
                      <label
                        htmlFor="termino-activo"
                        className="inline-flex cursor-pointer items-center gap-3"
                      >
                        <input
                          id="termino-activo"
                          type="checkbox"
                          name="activo"
                          checked={!!form.activo}
                          onChange={handleChange}
                          className="peer sr-only"
                        />
                        <span className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 transition peer-checked:bg-orange-500">
                          <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                        </span>
                        <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <ShieldCheck className="h-4 w-4 text-orange-500" />
                          Activo
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      <p className="text-sm leading-relaxed text-amber-800">
                        Si marcas este término como <strong>activo</strong>, se
                        desativara automáticamente los demás registros activos.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-orange-500" />
                      <h4 className="text-base font-bold text-slate-900">
                        Contenido del documento
                      </h4>
                    </div>

                    <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
                      <button
                        type="button"
                        onClick={() => setPreviewMode(false)}
                        className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                          !previewMode
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Editor
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewMode(true)}
                        className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                          previewMode
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Vista previa
                      </button>
                    </div>
                  </div>

                  <div className="mb-5 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleAddBlock(BLOCK_TYPES.TITLE)}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <LayoutTemplate className="h-4 w-4 text-orange-500" />
                      Título
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAddBlock(BLOCK_TYPES.PARAGRAPH)}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <AlignLeft className="h-4 w-4 text-orange-500" />
                      Párrafo
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAddBlock(BLOCK_TYPES.SECTION)}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <FileText className="h-4 w-4 text-orange-500" />
                      Sección
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAddBlock(BLOCK_TYPES.NOTE)}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <StickyNote className="h-4 w-4 text-orange-500" />
                      Nota
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAddBlock(BLOCK_TYPES.LIST)}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <List className="h-4 w-4 text-orange-500" />
                      Lista
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.08fr_0.92fr]">
                    <div className={`${previewMode ? 'hidden xl:block' : ''}`}>
                      <div className="space-y-4">
                        {form.bloques.map((block, index) => {
                          const BlockIcon = iconByType[block.tipo] || FileText;
                          const canMoveUp = index > 0;
                          const canMoveDown = index < form.bloques.length - 1;

                          return (
                            <div
                              key={block.id}
                              className="rounded-[22px] border border-slate-200 bg-slate-50 p-4"
                            >
                              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div className="flex flex-wrap items-center gap-3">
                                  <span className="inline-flex min-w-[78px] items-center justify-center rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-orange-700">
                                    Bloque {index + 1}
                                  </span>

                                  <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
                                    <BlockIcon className="h-4 w-4 text-orange-500" />
                                    Tipo
                                  </div>

                                  <select
                                    value={block.tipo}
                                    onChange={(e) =>
                                      handleBlockTypeChange(
                                        block.id,
                                        e.target.value
                                      )
                                    }
                                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                                  >
                                    <option value={BLOCK_TYPES.TITLE}>
                                      Título
                                    </option>
                                    <option value={BLOCK_TYPES.PARAGRAPH}>
                                      Párrafo
                                    </option>
                                    <option value={BLOCK_TYPES.SECTION}>
                                      Sección
                                    </option>
                                    <option value={BLOCK_TYPES.NOTE}>
                                      Nota destacada
                                    </option>
                                    <option value={BLOCK_TYPES.LIST}>
                                      Lista
                                    </option>
                                  </select>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    disabled={!canMoveUp}
                                    onClick={() =>
                                      handleMoveBlock(block.id, 'up')
                                    }
                                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                  >
                                    <ArrowUp className="h-3.5 w-3.5" />
                                    Subir
                                  </button>

                                  <button
                                    type="button"
                                    disabled={!canMoveDown}
                                    onClick={() =>
                                      handleMoveBlock(block.id, 'down')
                                    }
                                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                  >
                                    <ArrowDown className="h-3.5 w-3.5" />
                                    Bajar
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleAddBlock(
                                        BLOCK_TYPES.PARAGRAPH,
                                        index
                                      )
                                    }
                                    className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                                  >
                                    <Plus className="h-3.5 w-3.5" />
                                    Debajo
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteBlock(block.id)}
                                    className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Eliminar
                                  </button>
                                </div>
                              </div>

                              {(block.tipo === BLOCK_TYPES.TITLE ||
                                block.tipo === BLOCK_TYPES.SECTION ||
                                block.tipo === BLOCK_TYPES.NOTE ||
                                block.tipo === BLOCK_TYPES.LIST) && (
                                <div className="mb-3">
                                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    {block.tipo === BLOCK_TYPES.TITLE
                                      ? 'Título principal'
                                      : block.tipo === BLOCK_TYPES.SECTION
                                        ? 'Título de sección'
                                        : block.tipo === BLOCK_TYPES.NOTE
                                          ? 'Título de nota'
                                          : 'Título de lista'}
                                  </label>

                                  <input
                                    value={block.titulo || ''}
                                    onChange={(e) =>
                                      handleBlockChange(
                                        block.id,
                                        'titulo',
                                        e.target.value
                                      )
                                    }
                                    placeholder={
                                      block.tipo === BLOCK_TYPES.TITLE
                                        ? 'Ej: Carta de aceptación del cliente al servicio de débito automático'
                                        : block.tipo === BLOCK_TYPES.SECTION
                                          ? 'Ej: Procedimiento de baja'
                                          : block.tipo === BLOCK_TYPES.NOTE
                                            ? 'Ej: Importante'
                                            : 'Ej: Consideraciones generales'
                                    }
                                    className={inputClass}
                                  />
                                </div>
                              )}

                              {block.tipo !== BLOCK_TYPES.TITLE && (
                                <div>
                                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    {block.tipo === BLOCK_TYPES.LIST
                                      ? 'Ítems de la lista (uno por línea)'
                                      : 'Contenido'}
                                  </label>

                                  <div className="mb-3 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2">
                                    <button
                                      type="button"
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        applyInlineFormat(block.id, 'bold');
                                      }}
                                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                                    >
                                      <Bold className="h-3.5 w-3.5" />
                                      Negrita
                                    </button>

                                    <button
                                      type="button"
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        applyInlineFormat(block.id, 'italic');
                                      }}
                                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                                    >
                                      <Italic className="h-3.5 w-3.5" />
                                      Cursiva
                                    </button>
                                    <button
                                      type="button"
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        applyInlineFormat(
                                          block.id,
                                          'underline'
                                        );
                                      }}
                                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                                    >
                                      <Underline className="h-3.5 w-3.5" />
                                      Subrayado
                                    </button>
                                  </div>

                                  <textarea
                                    ref={(element) =>
                                      setTextareaRef(block.id, element)
                                    }
                                    rows={
                                      block.tipo === BLOCK_TYPES.LIST ? 6 : 7
                                    }
                                    value={block.texto || ''}
                                    onChange={(e) =>
                                      handleBlockChange(
                                        block.id,
                                        'texto',
                                        e.target.value
                                      )
                                    }
                                    onSelect={() => rememberSelection(block.id)}
                                    onKeyUp={() => rememberSelection(block.id)}
                                    onMouseUp={() =>
                                      rememberSelection(block.id)
                                    }
                                    onFocus={() => rememberSelection(block.id)}
                                    placeholder={
                                      block.tipo === BLOCK_TYPES.PARAGRAPH
                                        ? 'Escribe aquí el párrafo del documento...'
                                        : block.tipo === BLOCK_TYPES.SECTION
                                          ? 'Escribe aquí el contenido de esta sección...'
                                          : block.tipo === BLOCK_TYPES.NOTE
                                            ? 'Escribe aquí la nota destacada...'
                                            : 'Primer ítem\nSegundo ítem\nTercer ítem'
                                    }
                                    className={`${inputClass} min-h-[148px] resize-y`}
                                  />

                                  <p className="mt-2 text-xs text-slate-500">
                                    Usa la barra superior para aplicar formato
                                    al texto seleccionado.
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className={`${!previewMode ? 'hidden xl:block' : ''}`}>
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Eye className="h-4 w-4 text-orange-500" />
                        Vista previa final
                      </label>

                      <div className="min-h-[420px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                        {previewHtml ? (
                          <div className="max-h-[720px] overflow-y-auto p-5">
                            <div
                              className="max-w-none"
                              dangerouslySetInnerHTML={{ __html: previewHtml }}
                            />
                          </div>
                        ) : (
                          <div className="flex min-h-[360px] items-center justify-center p-6 text-center">
                            <div>
                              <Eye className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                              <p className="text-sm font-semibold text-slate-700">
                                Sin contenido para previsualizar
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                Agrega bloques al documento y la vista previa
                                aparecerá aquí.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                          Resumen
                        </p>

                        <div className="mt-3 grid grid-cols-2 gap-3">
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                            <p className="text-xs font-semibold text-slate-500">
                              Bloques totales
                            </p>
                            <p className="mt-1 text-lg font-bold text-slate-900">
                              {form.bloques.length}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                            <p className="text-xs font-semibold text-slate-500">
                              Con contenido
                            </p>
                            <p className="mt-1 text-lg font-bold text-slate-900">
                              {bloquesConContenido.length}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(249,115,22,0.24)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving
                      ? 'Guardando...'
                      : isEdit
                        ? 'Guardar cambios'
                        : 'Crear término'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
