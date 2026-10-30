"use client";

import React from "react";
import { Dialog } from "@/components/ui/Dialog";
import { ConnectRepositoryForm } from "./ConnectRepositoryForm";

export function ConnectRepositoryDialog({ isOpen, onClose, onSuccess }) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Connect GitHub Repository"
      description="Connect a public GitHub repository to discover vulnerabilities and prepare automated test harnesses."
      size="lg"
    >
      <ConnectRepositoryForm
        onSuccess={(project) => {
          if (onSuccess) onSuccess(project);
          onClose();
        }}
        onCancel={onClose}
      />
    </Dialog>
  );
}

