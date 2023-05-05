import React from "react";
import { motion } from "framer-motion";
import BpmnModeler from "../components/bpmnModeler";

function BpmnPage() {
  return (
    <motion.div
      className="container text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1 }}
      transition={{ duration: 0.75, ease: "easeOut" }}
    >
      <BpmnModeler />
    </motion.div>
  );
}

export default BpmnPage;
