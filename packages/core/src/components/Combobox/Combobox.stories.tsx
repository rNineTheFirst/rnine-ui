import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState, type ComponentProps } from 'react';
import { Button } from '../Button/Button';
import { Modal } from '../Modal/Modal';
import { Combobox, type ComboboxOption } from './Combobox';

const PARTS: ComboboxOption[] = [
  { value: 'pl-06', label: 'PL-06-1220', description: 'MS plate 6mm, 4×8 ft', keywords: ['plates'] },
  { value: 'pl-10', label: 'PL-10-1220', description: 'MS plate 10mm, 4×8 ft', keywords: ['plates'] },
  { value: 'pl-12', label: 'PL-12-1220', description: 'MS plate 12mm, 4×8 ft', keywords: ['plates'] },
  { value: 'ab-50', label: 'AB-50-6', description: 'Angle bar 50×50×5mm, 6m', keywords: ['angle bars'] },
  { value: 'ab-65', label: 'AB-65-6', description: 'Angle bar 65×65×6mm, 6m', keywords: ['angle bars'], disabled: true },
  { value: 'gi-50', label: 'GI-50-6', description: 'GI pipe 2 in, sch 40, 6m', keywords: ['pipes'] },
  { value: 'hb-m12', label: 'HB-M12-50', description: 'Hex bolt M12×50, zinc', keywords: ['fasteners'] },
  { value: 'hn-m12', label: 'HN-M12', description: 'Hex nut M12, zinc', keywords: ['fasteners'] },
  { value: 'wr-e6013', label: 'WR-E6013-25', description: 'Welding rod E6013 2.5mm, 5kg', keywords: ['consumables'] },
  { value: 'cd-4', label: 'CD-4-1', description: 'Cutting disc 4 in', keywords: ['consumables'] },
];

const meta = {
  title: 'Components/Combobox',
  component: Combobox,
  args: { label: 'Part', options: PARTS, value: null, onChange: () => {}, placeholder: 'Search by code or name' },
  parameters: {
    docs: {
      story: { inline: false, iframeHeight: 420 },
      description: {
        component:
          'A searchable picker (the ARIA 1.2 combobox with a list): type to narrow a long list, then arrows and Enter or a click. Every typed word has to match the label, description or keywords. Leaving the field with text that names no option puts the last pick back; emptying it clears the value. `onChange` also gets the option, to fill in what goes with it. The list opens over everything (no table, drawer or modal clips it). `filter={false}` + `onQueryChange` + `loading` for a search on a server. **Accent element:** the bar on the highlighted option, and the field’s own (the mark before the label, the caret, the focus edge).',
      },
    },
  },
  decorators: [(Story) => <div style={{ maxWidth: 420 }}><Story /></div>],
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

function PartPicker(props: Partial<ComponentProps<typeof Combobox>>) {
  const [value, setValue] = useState<string | null>(props.value ?? null);
  const [picked, setPicked] = useState<ComboboxOption | null>(null);
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Combobox
        label="Part"
        placeholder="Search by code or name"
        options={PARTS}
        {...props}
        value={value}
        onChange={(v, o) => {
          setValue(v);
          setPicked(o);
        }}
      />
      <small>Picked: {picked ? `${picked.label} (${picked.description})` : value ?? 'nothing'}</small>
    </div>
  );
}

export const Parts: Story = { render: () => <PartPicker hint="Try “plate 10” or “fasteners”." /> };
export const Picked: Story = { render: () => <PartPicker value="hb-m12" /> };
export const Required: Story = { args: { required: true } };
export const WithError: Story = { args: { error: 'Pick a part from the list.' } };
export const Disabled: Story = { args: { disabled: true, value: 'pl-10' } };

/** Results from a server: `filter={false}`, the query through `onQueryChange`, `loading` while it's on its way. */
function ServerSearch() {
  const [query, setQuery] = useState('');
  const [value, setValue] = useState<string | null>(null);
  const [results, setResults] = useState<ComboboxOption[]>(PARTS);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    const t = setTimeout(() => {
      setResults(PARTS.filter((p) => words.every((w) => `${p.label} ${p.description}`.toLowerCase().includes(w))));
      setLoading(false);
    }, 500);
    return () => clearTimeout(t);
  }, [query]);
  return (
    <Combobox
      label="Supplier part"
      options={results}
      value={value}
      onChange={setValue}
      filter={false}
      loading={loading}
      onQueryChange={(q) => {
        setLoading(true);
        setQuery(q);
      }}
      emptyMessage="No parts match. Check the code on the delivery receipt."
      loadingMessage="Searching…"
    />
  );
}
export const SearchOnServer: Story = { render: () => <ServerSearch /> };

function InModal() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>Add line</Button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Add a line" footer={<Button onClick={() => setOpen(false)}>Add</Button>}>
        <PartPicker />
      </Modal>
    </>
  );
}
/** Inside a Modal the list opens above it and Escape closes the list first, not the dialog. */
export const InsideAModal: Story = { render: () => <InModal /> };
