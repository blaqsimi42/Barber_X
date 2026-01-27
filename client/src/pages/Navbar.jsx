// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link as ScrollLink } from "react-scroll";
import { Menu, X, Scissors, Info, MapPin, Phone } from "lucide-react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { gsap } from "gsap";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("cuts"); // default active
  const navRef = useRef(null);
  const activeRef = useRef(null);
  const itemRefs = useRef([]);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const sections = [
    { name: "cuts", icon: Scissors },
    { name: "about", icon: Info },
    { name: "location", icon: MapPin },
    { name: "contact", icon: Phone },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(
        navRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: "power2.out", delay: 1 },
      );
    }
  }, []);

  // Animate the active highlight for smooth sliding
  useEffect(() => {
    const currentItem =
      itemRefs.current[sections.findIndex((s) => s.name === active)];
    if (currentItem && activeRef.current) {
      const { offsetLeft, offsetWidth } = currentItem;
      gsap.to(activeRef.current, {
        x: offsetLeft,
        width: offsetWidth,
        duration: 0.2,
        ease: "power2.out",
      });
    }
  }, [active, sections]);

  const handleDashboardClick = () => {
    if (!user || (user.role !== "admin" && user.role !== "worker")) {
      navigate("/admin-login");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <nav
      ref={navRef}
      className={` w-full absolute  top-0 z-50 transition-all duration-300 opacity-0 ${
        scrolled ? "bg-[#faf9f7]" : "bg-[#faf9f7]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center relative">
        {/* Brand */}
        <RouterLink
          to="/"
          className="text-xl font-semibold tracking-tight md:ml-14 text-indigo-600"
        >
          KlaudCuts
        </RouterLink>

        {/* Center: Pill Container */}
        <div className="hidden md:flex relative items-center mx-auto bg-indigo-600 rounded-2xl px-1 py-1 gap-1 shadow-md">
          {/* Active highlight div (optional for sliding effect) */}
          <div
            ref={activeRef}
            className="absolute top-0 bottom-0 bg-white rounded-2xl shadow-md"
            style={{ left: 0, width: 0 }}
          ></div>

          {sections.map((section, idx) => {
            const Icon = section.icon;
            const isActive = active === section.name;
            return (
              <ScrollLink
                key={section.name}
                to={section.name}
                smooth={true}
                duration={600}
                offset={-70}
                ref={(el) => (itemRefs.current[idx] = el)}
                onClick={() => setActive(section.name)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-2xl cursor-pointer font-medium transition-colors z-10 ${
                  isActive
                    ? "bg-white text-indigo-600 shadow-md"
                    : "text-white hover:text-indigo-100"
                }`}
              >
                <Icon size={18} />
                {section.name.charAt(0).toUpperCase() + section.name.slice(1)}
              </ScrollLink>
            );
          })}
        </div>

        {/* Dashboard Button */}
        <div className="hidden md:flex items-center">
          <button
            onClick={handleDashboardClick}
            className="bg-indigo-600 text-white font-medium border-2 border-white rounded-2xl px-6 py-2 hover:bg-indigo-700 transition md:ml-6 mr-12"
          >
            Dashboard
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-indigo-600"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white py-4 shadow-sm">
          <div className="flex flex-col items-center gap-5">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = active === section.name;
              return (
                <ScrollLink
                  key={section.name}
                  to={section.name}
                  smooth={true}
                  duration={600}
                  offset={-70}
                  onClick={() => {
                    setIsOpen(false);
                    setActive(section.name);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-medium cursor-pointer transition-colors ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "text-gray-700 hover:bg-indigo-50"
                  }`}
                >
                  <Icon size={18} />
                  {section.name.charAt(0).toUpperCase() + section.name.slice(1)}
                </ScrollLink>
              );
            })}
            <button
              onClick={() => {
                setIsOpen(false);
                handleDashboardClick();
              }}
              className="bg-indigo-600 text-white font-medium border-2 border-white rounded-2xl px-6 py-2 hover:bg-indigo-700 transition"
            >
              Dashboard
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
