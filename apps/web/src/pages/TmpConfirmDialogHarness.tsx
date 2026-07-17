import { useState } from 'react';

import { ConfirmDialog } from '../components/ConfirmDialog';

export function TmpConfirmDialogHarness() {
  const [open, setOpen] = useState(true);
  return (
    <div className="min-h-screen bg-canvas text-fg-primary">
      <button type="button" onClick={() => setOpen(true)}>Reopen</button>
      <ConfirmDialog
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
        title="Rotate GCP service-account key?"
        message="SAM will verify the new key before atomically replacing its encrypted copies. This does not disable the old key in Google Cloud; revoke it there after rotation succeeds."
        confirmLabel="Validate and rotate"
        variant="warning"
      />
    </div>
  );
}
