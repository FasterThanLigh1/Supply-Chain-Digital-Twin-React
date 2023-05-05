import React from "react";
import { motion } from "framer-motion";

function AnalyticPage() {
  return (
    <motion.div
      className="container text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1 }}
      transition={{ duration: 0.75, ease: "easeOut" }}
    >
      AnalyticPage
    </motion.div>
  );
}

export default AnalyticPage;
