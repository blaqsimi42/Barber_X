import React, { useState, useEffect, useRef } from "react";
import { Link as ScrollLink } from "react-scroll";
import { Menu, X, Scissors, Info, MapPin, Phone } from "lucide-react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { gsap } from "gsap";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("cuts");
  const navRef = useRef(null);
  const activeRef = useRef(null);
  const itemRefs = useRef([]);
  const mobileMenuRef = useRef(null);

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

  // Mobile menu animation (ADDITIVE)
  useEffect(() => {
    if (isOpen && mobileMenuRef.current) {
      gsap.fromTo(
        mobileMenuRef.current,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.25, ease: "power2.out" },
      );
    }
  }, [isOpen]);

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
      className={`w-full absolute top-0 z-50 transition-all duration-300 opacity-0 bg-[#faf9f7]`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center relative">
        {/* Brand */}
        <RouterLink
          to="/"
          className="text-xl font-semibold tracking-tight md:ml-14 md:mr-5 lg:mr-0 text-indigo-600"
        >
          KlaudCuts
        </RouterLink>

        {/* Desktop Pill Nav */}
        <div className="hidden md:flex relative items-center mx-auto bg-indigo-600 rounded-2xl px-1 py-1 gap-1 shadow-md">
          <div
            ref={activeRef}
            className="absolute top-0 bottom-0 bg-white rounded-2xl shadow-md"
            style={{ left: 0, width: 0 }}
          />

          {sections.map((section, idx) => {
            const Icon = section.icon;
            const isActive = active === section.name;
            return (
              <ScrollLink
                key={section.name}
                to={section.name}
                smooth
                duration={600}
                offset={-70}
                ref={(el) => (itemRefs.current[idx] = el)}
                onClick={() => setActive(section.name)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-2xl cursor-pointer font-medium z-10 transition-colors ${
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

        {/* Desktop Dashboard */}
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
          className="md:hidden text-indigo-600 z-50"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE CENTERED MENU (ADDITIVE, NO BREAKING CHANGES) */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex   justify-center bg-black/20">
          <div
            ref={mobileMenuRef}
            className="bg-white py-4 px-6 shadow-lg mt-4 rounded-2xl w-64 scale-9 h-70"
          >
            <div className="flex flex-col items-center gap-4 text-sm">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = active === section.name;
                return (
                  <ScrollLink
                    key={section.name}
                    to={section.name}
                    smooth
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
                    {section.name.charAt(0).toUpperCase() +
                      section.name.slice(1)}
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
        </div>
      )}
    </nav>
  );
};

export default Navbar;
