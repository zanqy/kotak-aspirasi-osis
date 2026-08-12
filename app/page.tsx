"use client";

import { useState, useCallback } from "react";
import ScrollytellingStage from "@/components/landing/ScrollytellingStage";
import EnvelopeForm from "@/components/landing/EnvelopeForm";
import StatusModal from "@/components/landing/StatusModal";
import PageLoader from "@/components/landing/PageLoader";
import { IconCheck } from "@tabler/icons-react";
import styles from "./page.module.css";

export default function Home() {
  const [statusOpen, setStatusOpen] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; kode: string }>({ show: false, kode: "" });

  const handleSubmitSuccess = useCallback((kode: string) => {
    setToast({ show: true, kode });
    setTimeout(() => setToast({ show: false, kode: "" }), 4000);
  }, []);

  return (
    <>
      <PageLoader />

      <ScrollytellingStage>
        <EnvelopeForm
          onOpenStatus={() => setStatusOpen(true)}
          onSubmitSuccess={handleSubmitSuccess}
        />
      </ScrollytellingStage>

      <StatusModal open={statusOpen} onClose={() => setStatusOpen(false)} />

      {/* Toast */}
      <div className={`${styles.toast}${toast.show ? ` ${styles.toastShow}` : ""}`}>
        <div className={styles.toastIcon}><IconCheck size={18} aria-hidden="true" /></div>
        <div>
          <b>Surat Berhasil Mendarat</b>
          <span>{toast.kode}</span>
        </div>
      </div>
    </>
  );
}
