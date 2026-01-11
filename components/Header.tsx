"use client";

import { useState } from "react";
import ThreatLevel from "./ThreatLevel";
import MonitoringCounter from "./MonitoringCounter";
import SituationDropdown from "./SituationDropdown";
import SituationModal from "./SituationModal";

export default function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSituationId, setEditingSituationId] = useState<string | null>(null);

  const handleOpenModal = () => {
    setEditingSituationId(null);
    setIsModalOpen(true);
  };

  const handleEditSituation = (id: string) => {
    setEditingSituationId(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSituationId(null);
  };

  return (
    <>
      <header className="header">
        {/* Left: Logo + Situation Selector */}
        <div className="flex items-center gap-3">
          <div className="text-red-500 font-bold text-sm tracking-widest hidden sm:block">
            MONITOR THE SITUATIONS
          </div>
          <div className="text-red-500 font-bold text-sm tracking-widest sm:hidden">
            MTS
          </div>
          <SituationDropdown
            onOpenModal={handleOpenModal}
            onEditSituation={handleEditSituation}
          />
        </div>

        {/* Center: Threat Level */}
        <div className="hidden md:flex">
          <ThreatLevel />
        </div>

        {/* Right: Counter */}
        <div className="hidden sm:flex">
          <MonitoringCounter />
        </div>
      </header>

      {/* Modal for creating/editing situations */}
      <SituationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingSituationId={editingSituationId}
      />
    </>
  );
}
