import React from "react";
import { Link, Route, Routes } from "react-router-dom";
import { Button } from "antd";
import { simulationRoute } from "../constants/route";
import { motion } from "framer-motion";

function LandingPage() {
  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1 }}
      transition={{ duration: 0.75, ease: "easeOut" }}
    >
      <div className="h-480 flex flex-col text-white bg-sky-900">
        <main className="container mx-auto px-6 pt-16 flex-1 text-center">
          <h2 className="text-2xl md:text-4xl lg:text-6xl uppercase">
            SUPPLY CHAIN
          </h2>
          <h1 className="text-3xl md:text-6xl lg:text-8xl uppercase font-black mb-8">
            DIGITAL TWIN
          </h1>

          <p className="text-base md:text-lg lg:text-2xl mb-8">
            DEEPEN YOUR KNOWLEDGE OF SUPPLY CHAIN DIGITAL TWINS AND CONTROL
            TOWERS
          </p>
          <Link to={simulationRoute}>
            <Button
              name="member[subscribe]"
              id="member_submit"
              className="mt-8 mb-8 items-center h-20 py-2 px-4 md:text-2xl lg:text-1xl justify-between w-fit lg:px-12 font-bold uppercase cursor-pointer hover:opacity-75 rounded-full text-white"
              //className="bg-primary md:rounded-tl-none md:rounded-bl-none rounded-full text-2xl py-4 px-6 md:px-10 lg:py-6 lg:px-12 font-bold uppercase cursor-pointer hover:opacity-75 duration-150"
            >
              Get Started
            </Button>
          </Link>
        </main>

        <footer className="fixed bottom-0 left-0 z-20 w-full p-4 shadow md:flex md:items-center md:justify-between md:p-6 dark:bg-gray-800 dark:border-gray-600">
          <span className="text-sm text-white sm:text-center dark:text-white">
            © 2023{" "}
            <a href="https://flowbite.com/" className="hover:underline">
              Flowbite™
            </a>
            . All Rights Reserved.
          </span>
          <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-white dark:text-white sm:mt-0">
            <li>
              <a href="#" className="mr-4 hover:underline md:mr-6">
                About
              </a>
            </li>
            <li>
              <a href="#" className="mr-4 hover:underline md:mr-6">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="mr-4 hover:underline md:mr-6">
                Licensing
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Contact
              </a>
            </li>
          </ul>
        </footer>
      </div>
    </motion.div>
  );
}

export default LandingPage;
