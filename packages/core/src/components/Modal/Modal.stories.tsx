import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '../Button/Button';
import { TextField } from '../Field/Field';
import { Modal } from './Modal';

const meta = {
  title: 'Components/Modal',
  component: Modal,
  args: { isOpen: false, onClose: () => {}, title: 'Delete this post?', children: null },
  parameters: {
    docs: {
      description: {
        component:
          'A modal dialog on the native `<dialog>` element: focus moves in and is trapped, the page behind is inert, Escape and the backdrop close it, focus returns to the trigger. **Accent element:** the mark after the title and the lit cut corner.',
      },
    },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

function ConfirmDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>Delete post</Button>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Delete this post?"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Keep it</Button>
            <Button onClick={() => setOpen(false)}>Delete</Button>
          </>
        }
      >
        “The build cache went live” will be removed from the blog. Comments go with it. This can’t be undone.
      </Modal>
    </>
  );
}

function FormDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Edit profile</Button>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Edit profile"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Save</Button>
          </>
        }
      >
        <div style={{ display: 'grid', gap: 16 }}>
          <TextField label="Name" defaultValue="Sam Doe" />
          <TextField label="Role" defaultValue="Full-stack developer" />
        </div>
      </Modal>
    </>
  );
}

export const Open: Story = {
  args: {
    isOpen: true,
    size: 'sm',
    children: '“The build cache went live” will be removed from the blog. Comments go with it. This can’t be undone.',
    footer: (
      <>
        <Button variant="ghost">Keep it</Button>
        <Button>Delete</Button>
      </>
    ),
  },
  parameters: { docs: { story: { inline: false, iframeHeight: 360 } } },
};

export const Confirm: Story = { render: () => <ConfirmDemo /> };
export const WithForm: Story = { render: () => <FormDemo /> };
