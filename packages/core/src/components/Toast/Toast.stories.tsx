import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button/Button';
import { ToastProvider, useToast } from './Toast';

const meta = {
  title: 'Components/Toast',
  component: ToastProvider,
  args: { children: null },
  parameters: {
    docs: {
      description: {
        component:
          'Short notices raised with `useToast()` (`success`, `error`, `warning`, `info`, `addToast`, `dismissToast`). Wrap the app in `ToastProvider` once. They pause while hovered or focused; errors stay longer and use `role="alert"`. **Accent element:** the countdown line along the bottom.',
      },
    },
  },
} satisfies Meta<typeof ToastProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

function Buttons() {
  const toast = useToast();
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <Button size="sm" onClick={() => toast.success('Published. It’s live at /blog/turbo-cache.')}>Success</Button>
      <Button size="sm" variant="outline" onClick={() => toast.info('Build queued on the runner.')}>Info</Button>
      <Button size="sm" variant="outline" onClick={() => toast.warning('Cache is cold: this build runs in full.')}>Warning</Button>
      <Button size="sm" variant="outline" onClick={() => toast.error('Couldn’t save the post: the title is empty.')}>Error</Button>
    </div>
  );
}

export const Playground: Story = {
  render: () => (
    <ToastProvider>
      <Buttons />
    </ToastProvider>
  ),
  parameters: { layout: 'fullscreen', docs: { story: { inline: false, iframeHeight: 420 } } },
};
