import React, { useEffect, useRef, useState } from "react";
import { Scissors, MapPin, Phone, CircleCheck, ArrowRight } from "lucide-react";
import { useGetCutsQuery } from "../redux/api/cutsApiSlice";
import Navbar from "./Navbar";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link, useLocation } from "react-router-dom";
import { Loader } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  const { data: cuts, isLoading, isError } = useGetCutsQuery();
  const [scrollY, setScrollY] = useState(0);
  const location = useLocation();

  const heroDivRef = useRef(null);
  const heroImageRef = useRef(null);
  const heroTextRef = useRef(null);
  const heroButtonRef = useRef(null);
  const cardRef = useRef(null);
  const cardItemsRef = useRef([]);

  const cutsDivRef = useRef(null);
  const cutsInnerRef = useRef(null);
  const cutsGridRef = useRef([]);

  const story1Ref = useRef(null);
  const story2Ref = useRef(null);
  const locationCardRef = useRef(null);

  const stories = [
    {
      id: 1,
      title: "Precision & Craft",
      text: "Every cut begins with understanding. We don't just trim hair — we study your features, your style, your vision. Our barbers are trained artisans who treat each head as a canvas, bringing precision and passion to every snip.",
      image:
        "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=1200&h=800&fit=crop",
      imagePosition: "left",
    },
    {
      id: 2,
      title: "Luxury Atmosphere",
      text: "Step into a space designed for relaxation and style. From our leather chairs to curated playlists, every detail is crafted to make your visit an escape. This isn't just a haircut — it's an experience you'll want to return to.",
      image:
        "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&h=800&fit=crop",
      imagePosition: "right",
    },
  ];

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const elements = [
      heroImageRef.current,
      heroDivRef.current,
      heroTextRef.current,
      heroButtonRef.current,
      cardRef.current,
    ];
    if (elements.some((el) => !el)) return;

    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    gsap.set(elements, { willChange: "transform, opacity" });

    tl.fromTo(
      heroDivRef.current,
      { height: 0, transformOrigin: "top center" },
      { height: 550, duration: 1.8, ease: "power2.inOut" },
    )
      .fromTo(
        heroImageRef.current,
        { scale: 2.5, x: "20%", opacity: 0 },
        { scale: 1, x: "0%", opacity: 1, duration: 2 },
        "-=1.6",
      )
      .fromTo(
        heroTextRef.current,
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2 },
        "-=0.8",
      )
      .fromTo(
        heroButtonRef.current,
        { x: -40, opacity: 0, scale: 0.9 },
        { x: 0, opacity: 1, scale: 1, duration: 0.8 },
        "-=0.6",
      )
      .fromTo(
        cardRef.current,
        { x: 100, y: -30, opacity: 0, rotation: 8 },
        { x: 0, y: 0, opacity: 1, rotation: 0, duration: 1.2 },
        "-=0.7",
      )
      .fromTo(
        cardItemsRef.current.filter(Boolean),
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.08 },
        "-=0.9",
      );

    return () => {
      tl.kill();
      gsap.set(elements, { willChange: "auto" });
    };
  }, []);

  useEffect(() => {
    if (!cutsDivRef.current || !cutsInnerRef.current) return;

    gsap.fromTo(
      cutsInnerRef.current,
      { y: 0 },
      {
        y: 120,
        ease: "none",
        scrollTrigger: {
          trigger: cutsDivRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );
  }, []);

  useEffect(() => {
    cutsGridRef.current.forEach((card, i) => {
      if (!card) return;
      gsap.fromTo(
        card,
        { scale: 0.85 },
        {
          scale: 1,
          duration: 0.8,
          ease: "power3.out",
          delay: i * 0.1,
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        },
      );
    });
  }, [cuts]);

  useEffect(() => {
    [story1Ref.current, story2Ref.current].forEach((el, index) => {
      if (!el) return;
      const imageEl = el.querySelector("img");
      const textEl = el.querySelector('[class*="text-white"]')?.parentElement;

      gsap.fromTo(
        el,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        },
      );

      if (imageEl) {
        gsap.fromTo(
          imageEl,
          {
            y: 0,
          },
          {
            y: -40,
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
              onUpdate: (self) => {
                gsap.set(imageEl, { y: self.getVelocity() * -0.1 });
              },
            },
          },
        );
      }

      if (textEl) {
        gsap.fromTo(
          textEl,
          { opacity: 0, x: index === 0 ? -40 : 40 },
          {
            opacity: 1,
            x: 0,
            duration: 1,
            scrollTrigger: {
              trigger: el,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }
    });
  }, []);

  useEffect(() => {
    if (!locationCardRef.current) return;
    gsap.fromTo(
      locationCardRef.current,
      { opacity: 0, y: 60, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.2,
        scrollTrigger: {
          trigger: locationCardRef.current,
          start: "top 85%",
        },
      },
    );
  }, []);

  useEffect(
    () => () => ScrollTrigger.getAll().forEach((t) => t.kill(true)),
    [location.pathname],
  );

  const heroParallax = scrollY * 0.4;
  const heroOpacity = Math.max(1 - scrollY / 700, 0);

  return (
    <>
      {/* Hero Section */}
      <section
        id="hero"
        className="min-h-screen flex flex-col justify-center items-center text-center bg-gradient-to-br from-[#faf9f7] to-white relative overflow-hidden px-4 md:px-8 lg:px-12"
      >
        <Navbar />
        <div
          ref={heroDivRef}
          className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 lg:mt-20"
          style={{
            transform: `translateY(${heroParallax}px)`,
            opacity: heroOpacity,
            height: 550,
          }}
        >
          <img
            ref={heroImageRef}
            src="img1.jpg"
            alt="Barber cutting hair in shop"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute bottom-16 left-8 md:left-12 text-left">
            <h1
              ref={heroTextRef}
              className="text-4xl text-white md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight tracking-tight"
            >
              Designed to Define <br />
              <span className="text-indigo-600 bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
                Your Style
              </span>
            </h1>
            <a
              ref={heroButtonRef}
              href="#cuts"
              className="group inline-flex items-center gap-2 mt-8 bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:bg-indigo-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              Explore Cuts <ArrowRight size={20} />
            </a>
          </div>

          <div
            ref={cardRef}
            className="absolute top-20 md:top-12 lg:top-78 lg:left-197 left-5 md:left-98 bg-white rounded-2xl shadow-2xl p-6 md:p-7 sm:w-50 lg:w-80 md:w-96 border border-indigo-100"
          >
            <ul className="flex flex-col gap-3">
              {[
                "Professional barbers",
                "Modern stylish haircuts",
                "Clean and luxury environment",
                "Timely and efficient service",
              ].map((point, i) => (
                <li
                  key={i}
                  ref={(el) => (cardItemsRef.current[i] = el)}
                  className="flex items-start gap-3 text-gray-700 text-sm md:text-base"
                >
                  <CircleCheck
                    size={20}
                    className="text-indigo-600 flex-shrink-0 mt-0.5"
                  />
                  <span className="font-medium">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Cuts Section */}
      <section
        id="cuts"
        ref={cutsDivRef}
        className="bg-gradient-to-b from-white via-indigo-50 to-white overflow-visible w-full h-auto flex flex-col pb-24"
      >
        <div ref={cutsInnerRef} className="w-full flex flex-col">
          <div className="text-center py-6 px-4">
            <h2 className="text-3xl md:text-3xl font-bold mb-1 text-indigo-600">
              Our Signature Cuts
            </h2>
            <p className="text-gray-600 text-sm md:text-base font-medium">
              Handpicked styles loved by our clients
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-80">
              <Loader className="animate-spin w-12 h-12 text-indigo-600" />
            </div>
          ) : isError ? (
            <p className="text-center text-red-500 text-lg font-semibold">
              Failed to load cuts
            </p>
          ) : cuts?.data?.length === 0 ? (
            <p className="text-center text-gray-500 text-lg">
              No cuts available yet.
            </p>
          ) : (
            <div className="w-full px-4 md:px-6 lg:px-12 flex-1 flex flex-col">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-16 lg:gap-12 justify-items-center">
                {cuts.data.slice(0, 3).map((cut, i) => (
                  <div
                    key={cut._id}
                    ref={(el) => (cutsGridRef.current[i] = el)}
                    className="w-full max-w-xs sm:max-w-none sm:w-80 md:w-64 lg:w-80 bg-white rounded-3xl shadow-lg overflow-hidden border border-indigo-100 flex flex-col justify-between group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 h-98  md:h-80 lg:h-96"
                  >
                    <div className="overflow-hidden h-65  md:h-44 lg:h-58">
                      <img
                        src={cut.imageUrl}
                        alt={cut.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 "
                      />
                    </div>
                    <div className="p-5 sm:p-2 md:p-3 flex flex-col justify-between flex-1 mb-5">
                      <div>
                        <h3 className="font-bold text-xs md:text-sm text-indigo-700 flex items-center gap-1 line-clamp-1">
                          <Scissors size={14} /> {cut.name}
                        </h3>
                        <p className="text-gray-600 text-xs line-clamp-1 leading-tight">
                          {cut.description || "Premium cut"}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-indigo-100 pt-1 text-xs">
                        <p className="font-bold text-indigo-600 text-xs">
                          ₦{cut.price}
                        </p>
                        <span className="text-gray-400 text-xs italic line-clamp-1">
                          Premium
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Main Showcase Button */}
              <div className="flex justify-center w-full mt-4 md:mt-6 px-4">
                <Link
                  to="/showcase"
                  className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 md:px-8 py-2 md:py-3 rounded-full font-semibold text-sm md:text-base shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all duration-300 w-full sm:w-auto"
                >
                  View All Cuts
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden py-24 md:py-32 w-full mt-8"
      >
        {[story1Ref, story2Ref].map((ref, index) => {
          const story = stories[index];
          return (
            <div
              key={story.id}
              ref={ref}
              className={`flex flex-col md:flex-row gap-12 md:gap-16 px-6 md:px-12 lg:px-20 mb-24 md:mb-32 max-w-7xl mx-auto ${
                story.imagePosition === "left" ? "" : "md:flex-row-reverse"
              }`}
            >
              <div className="w-full md:w-1/2">
                <img
                  src={story.image}
                  alt={story.title}
                  loading="lazy"
                  className="rounded-3xl shadow-2xl object-cover w-full h-96 md:h-[500px] lg:h-[550px]"
                />
              </div>
              <div className="w-full md:w-1/2 text-white space-y-6 flex flex-col justify-center">
                <span className="text-indigo-400 font-bold text-xs tracking-[0.3em] uppercase">
                  Chapter {index === 0 ? "01" : "02"}
                </span>
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                  {story.title}
                </h3>
                <p className="text-gray-300 text-base md:text-lg lg:text-xl leading-relaxed">
                  {story.text}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Location Section */}
      <section
        id="location"
        className="relative min-h-screen bg-gradient-to-br from-white via-indigo-50 to-white overflow-hidden flex items-center justify-center py-20 md:py-32"
      >
        <div className="px-4 md:px-8 w-full">
          <div
            ref={locationCardRef}
            className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-indigo-100 text-center space-y-8"
          >
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-full p-6 shadow-xl">
                <MapPin size={48} className="text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900">
                Visit Our Shop
              </h3>
              <p className="text-lg md:text-xl text-gray-700 font-semibold leading-relaxed">
                12 Kings Avenue, Lekki Phase 1, Lagos, Nigeria
              </p>
            </div>

            {/* Hours Section */}
            <div className="mt-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 md:p-8 space-y-4 border border-indigo-100">
              {[
                { label: "Working Hours", value: "9:00 AM" },
                { label: "Closing Hours", value: "8:00 PM" },
                { label: "Earliest Booking", value: "5:00 AM" },
              ].map((hour) => (
                <div
                  key={hour.label}
                  className="flex justify-between items-center text-gray-800 pb-3 last:pb-0 border-b border-indigo-200 last:border-b-0"
                >
                  <div className="flex items-center gap-3 font-semibold">
                    <div className="bg-indigo-600 rounded-full p-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    {hour.label}
                  </div>
                  <span className="font-bold text-indigo-600 text-lg">
                    {hour.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        id="contact"
        className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-12 md:py-16 text-center space-y-4 border-t-2 border-indigo-500"
      >
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-2xl md:text-3xl font-bold flex justify-center items-center gap-2 mb-6">
            <Phone size={24} /> Contact Us
          </h3>
          <div className="space-y-2 mb-6">
            <p className="text-lg md:text-xl">
              Email: <span className="font-semibold">hello@klaudcuts.com</span>
            </p>
            <p className="text-lg md:text-xl">
              Phone: <span className="font-semibold">+234 801 234 5678</span>
            </p>
          </div>
          <p className="text-indigo-200 text-sm md:text-base mt-6 pt-6 border-t border-indigo-500">
            © {new Date().getFullYear()} Klaud Cuts — All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
};

export default LandingPage;
