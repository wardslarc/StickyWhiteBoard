import React from "react";
import { Button } from "../ui/button";
import { motion } from "framer-motion";

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  onCtaClick?: () => void;
}

const HeroSection = ({
  title = "Collaborate Visually with Sticky White Board",
  subtitle = "The digital whiteboard that brings your team's ideas to life with colorful sticky notes and intuitive drawing tools.",
  ctaText = "Start Collaborating for Free",
  onCtaClick = () => console.log("CTA clicked"),
}: HeroSectionProps) => {
  return (
    <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50">
      <div className="container px-4 md:px-6 mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
        <motion.div
          className="flex flex-col gap-4 lg:gap-6 lg:w-1/2 text-center lg:text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-[600px] mx-auto lg:mx-0">
            {subtitle}
          </p>
          <div className="mt-4 lg:mt-8">
            <Button
              size="lg"
              onClick={onCtaClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              {ctaText}
            </Button>
          </div>
        </motion.div>

        <motion.div
          className="lg:w-1/2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
            <div className="absolute top-0 left-0 right-0 h-8 bg-gray-100 flex items-center px-3 border-b border-gray-200">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
            </div>
            <div className="pt-8 p-4 bg-gray-50 min-h-[400px]">
              {/* Placeholder for WhiteboardPreview component */}
              <div className="bg-white rounded-lg shadow-inner h-full min-h-[350px] p-4 relative">
                {/* Sample sticky notes */}
                <div className="absolute top-12 left-8 w-40 h-40 bg-yellow-200 p-3 rounded shadow-md transform rotate-2">
                  <p className="text-sm font-medium">Team meeting notes</p>
                  <p className="text-xs mt-2">- Review Q3 goals</p>
                  <p className="text-xs">- Discuss new feature ideas</p>
                  <p className="text-xs">- Plan team building</p>
                </div>

                <div className="absolute top-24 left-52 w-36 h-36 bg-blue-200 p-3 rounded shadow-md transform -rotate-1">
                  <p className="text-sm font-medium">Project Timeline</p>
                  <p className="text-xs mt-2">Design: 2 weeks</p>
                  <p className="text-xs">Development: 4 weeks</p>
                  <p className="text-xs">Testing: 1 week</p>
                </div>

                <div className="absolute top-48 left-20 w-32 h-32 bg-green-200 p-3 rounded shadow-md transform rotate-3">
                  <p className="text-sm font-medium">Ideas</p>
                  <p className="text-xs mt-2">- Mobile app</p>
                  <p className="text-xs">- Dark mode</p>
                  <p className="text-xs">- Export to PDF</p>
                </div>

                <div className="absolute top-40 right-20 w-36 h-36 bg-pink-200 p-3 rounded shadow-md transform -rotate-2">
                  <p className="text-sm font-medium">Feedback</p>
                  <p className="text-xs mt-2">
                    "Love the collaboration features!"
                  </p>
                  <p className="text-xs">"Need better drawing tools"</p>
                </div>

                {/* Sample drawing - simple arrow */}
                <svg
                  className="absolute top-32 left-40 w-20 h-20"
                  viewBox="0 0 100 100"
                >
                  <path
                    d="M10,50 L70,50 L60,40 M70,50 L60,60"
                    stroke="#333"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>

                {/* Sample drawing - simple circle */}
                <svg
                  className="absolute bottom-20 right-40 w-16 h-16"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#333"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
