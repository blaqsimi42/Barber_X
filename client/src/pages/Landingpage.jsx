// src/pages/LandingPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { Scissors, MapPin, Phone, CircleCheck } from "lucide-react";
import { useGetCutsQuery } from "../redux/api/cutsApiSlice";
import Navbar from "./Navbar";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link, useLocation } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  const { data: cuts, isLoading, isError } = useGetCutsQuery();
  const [scrollY, setScrollY] = useState(0);
  const location = useLocation();

  // refs
  const heroDivRef = useRef(null);
  const heroImageRef = useRef(null);
  const heroTextRef = useRef(null);
  const heroButtonRef = useRef(null);
  const cardRef = useRef(null);
  const cardItemsRef = useRef([]);
  const cutsGridRef = useRef([]);
  const story1Ref = useRef(null);
  const story2Ref = useRef(null); // Using story2 as second story
  const locationIconRef = useRef(null);
  const locationTitleRef = useRef(null);
  const locationTextRef = useRef(null);
  const locationAddressRef = useRef(null);
  const locationButtonsRef = useRef(null);

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

  // Track scroll
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // HERO animation
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
        { scale: 2.5, x: "20%", transformOrigin: "center right", opacity: 0 },
        { scale: 1, x: "0%", opacity: 1, duration: 2, ease: "power3.out" },
        "-=1.6",
      )
      .fromTo(
        heroTextRef.current,
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: "back.out(1.4)" },
        "-=0.8",
      )
      .fromTo(
        heroButtonRef.current,
        { x: -40, opacity: 0, scale: 0.9 },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "elastic.out(1,0.6)",
        },
        "-=0.6",
      )
      .fromTo(
        cardRef.current,
        { x: 100, y: -30, opacity: 0, rotation: 8 },
        {
          x: 0,
          y: 0,
          opacity: 1,
          rotation: 0,
          duration: 1.2,
          ease: "back.out(1.2)",
        },
        "-=0.7",
      )
      .fromTo(
        cardItemsRef.current.filter(Boolean),
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power2.out" },
        "-=0.9",
      );

    return () => {
      tl.kill();
      gsap.set(elements, { willChange: "auto" });
    };
  }, []);

  // CUTS grid
  useEffect(() => {
    if (!cuts?.data) return;
    const triggers = [];
    cutsGridRef.current.forEach((ref, i) => {
      if (!ref) return;
      const anim = gsap.fromTo(
        ref,
        { y: 60, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ref,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
          delay: i * 0.15,
        },
      );
      triggers.push(anim.scrollTrigger);
    });
    return () => triggers.forEach((t) => t?.kill(true));
  }, [cuts]);

  // ABOUT section scroll animation (story 1 and 2)
  useEffect(() => {
    [story1Ref.current, story2Ref.current].forEach((el) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, y: 50, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      );
    });
  }, []);

  // LOCATION card animation
  useEffect(() => {
    if (!locationAddressRef.current || !locationButtonsRef.current) return;
    gsap.fromTo(
      locationAddressRef.current,
      { opacity: 0, y: 50, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: locationAddressRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      },
    );
    gsap.fromTo(
      locationButtonsRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: locationButtonsRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      },
    );
  }, []);

  // Cleanup ScrollTrigger
  useEffect(
    () => () => ScrollTrigger.getAll().forEach((t) => t.kill(true)),
    [location.pathname],
  );

  const heroParallax = scrollY * 0.4;
  const heroOpacity = Math.max(1 - scrollY / 700, 0);

  return (
    <>
      {/* HERO */}
      <section
        id="hero"
        className="min-h-screen flex flex-col justify-center items-center text-center bg-[#faf9f7] relative overflow-hidden"
      >
        <Navbar />
        <div
          ref={heroDivRef}
          className="relative w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 lg:mt-16"
          style={{
            transform: `translateY(${heroParallax}px)`,
            opacity: heroOpacity,
            height: 550,
          }}
        >
          <img
            ref={heroImageRef}
            src="img1.jpg"
            alt="Barber at work"
            className="w-full h-150.5 md:h-140.5 object-cover"
          />
          <div className="absolute bottom-12 left-10 text-left">
            <h1
              ref={heroTextRef}
              className="text-4xl md:text-5xl font-semibold text-gray-100 leading-tight"
            >
              Designed to Define <br />
              <span className="text-indigo-500 font-bold">Your Style</span>
            </h1>
            <a
              ref={heroButtonRef}
              href="#cuts"
              className="group inline-block mt-6 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-indigo-700 border-2 border-white transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              Explore Cuts
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </a>
          </div>
          <div
            ref={cardRef}
            className="absolute sm:top-74 md:top-83 right-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 w-72 md:w-80 border border-white/20"
          >
            <ul className="flex flex-col gap-2">
              {[
                "Professional barbers with expertise",
                "Modern, stylish haircuts",
                "Clean and luxury environment",
                "Timely and efficient service",
              ].map((point, i) => (
                <li
                  key={i}
                  ref={(el) => (cardItemsRef.current[i] = el)}
                  className="flex items-center gap-2 text-gray-700"
                >
                  <CircleCheck size={16} className="text-indigo-600" /> {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CUTS */}
      <section id="cuts" className="py-20 bg-white overflow-hidden w-full">
        <div className="text-center mb-12 w-full">
          <h2 className="text-4xl font-bold text-indigo-600">
            Our Signature Cuts
          </h2>
          <p className="text-gray-500 text-lg">
            Handpicked styles loved by our clients
          </p>
        </div>
        {isLoading ? (
          <p className="text-center text-indigo-600">Loading cuts...</p>
        ) : isError ? (
          <p className="text-center text-red-500">Failed to load cuts</p>
        ) : cuts?.data?.length === 0 ? (
          <p className="text-center text-gray-500">No cuts available yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {cuts.data.slice(0, 3).map((cut, i) => (
              <div
                key={cut._id}
                ref={(el) => (cutsGridRef.current[i] = el)}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-indigo-100 flex flex-col justify-between group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
              >
                <div className="overflow-hidden">
                  <img
                    src={cut.imageUrl}
                    alt={cut.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="p-6 flex flex-col justify-between">
                  <div className="flex flex-col text-left mb-4">
                    <h3 className="font-bold text-xl text-indigo-700 mb-1 flex items-center gap-2">
                      <Scissors size={18} /> {cut.name}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {cut.description ||
                        "A premium style cut for modern looks."}
                    </p>
                  </div>
                  <div className="mt-auto flex justify-between items-center border-t border-indigo-100 pt-4">
                    <p className="text-lg font-semibold text-indigo-600">
                      ₦{cut.price}
                    </p>
                    <span className="text-gray-500 text-sm italic">
                      {cut.name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ABOUT */}
      <section
        id="about"
        className="relative bg-[#0a0a0a] overflow-hidden py-20 w-full"
      >
        {[story1Ref, story2Ref].map((ref, index) => {
          const story = stories[index];
          return (
            <div
              key={story.id}
              ref={ref}
              className={`flex flex-col md:flex-row ml-12 justify-center items-center gap-12 mb-20 w-3/4 ${story.imagePosition === "left" ? "" : "md:flex-row-reverse"}`}
            >
              <div className="md:w-2/2">
                <img
                  src={story.image}
                  alt={story.title}
                  className="rounded-2xl shadow-2xl object-cover w-full h-96"
                />
              </div>
              <div className="md:w-1/2 lg:w-30px text-white space-y-4">
                <div className="inline-block">
                  <span className="text-indigo-500 font-bold text-xs tracking-[0.3em] uppercase">
                    Chapter {index === 0 ? "01" : "02"}
                  </span>
                </div>
                <h3 className="text-3xl md:text-5xl font-bold">
                  {story.title}
                </h3>
                <p className="text-gray-300 text-lg md:text-xl">{story.text}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* LOCATION */}
      <section
        id="location"
        className="relative h-screen bg-linear-to-br from-white via-indigo-50 to-white overflow-hidden"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-7xl mx-auto w-full px-4 md:px-8">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="space-y-6 md:space-y-8">
                <div ref={locationIconRef} className="inline-block">
                  <div className="bg-indigo-600 rounded-full p-6 shadow-xl">
                    <MapPin size={48} className="text-white" />
                  </div>
                </div>
                <h2
                  ref={locationTitleRef}
                  className="text-5xl md:text-6xl font-bold text-gray-900"
                >
                  Find Us
                </h2>
                <p
                  ref={locationTextRef}
                  className="text-gray-600 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed font-light px-4"
                >
                  Located in the heart of Lekki — where style meets convenience.
                </p>
              </div>
            </div>
            {/* Address Card */}
            <div
              ref={locationAddressRef}
              className="absolute inset-0 flex items-center justify-center opacity-0 px-4 md:px-8"
            >
              <div className="w-full max-w-2xl text-center space-y-8 md:space-y-12">
                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border-2 border-indigo-100">
                  <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
                    <div className="bg-indigo-100 rounded-full p-4">
                      <MapPin size={40} className="text-indigo-600" />
                    </div>
                    <div className="text-center md:text-left">
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        Visit Our Shop
                      </h3>
                      <p className="text-lg md:text-xl text-gray-700 font-medium">
                        12 Kings Avenue, Lekki Phase 1
                      </p>
                      <p className="text-base md:text-lg text-gray-500">
                        Lagos, Nigeria
                      </p>
                    </div>
                  </div>
                  <div
                    ref={locationButtonsRef}
                    className="mt-8 pt-8 border-t border-indigo-100 flex justify-center gap-4"
                  >
                    <a
                      href="#contact"
                      className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2"
                    >
                      <Phone size={20} /> Contact Us
                    </a>
                    <a
                      href="#cuts"
                      className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold flex items-center gap-2 border-2 border-indigo-600"
                    >
                      <Scissors size={20} /> View Our Cuts
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        id="contact"
        className="bg-indigo-600 text-white py-10 text-center space-y-3"
      >
        <h3 className="text-xl font-semibold flex justify-center items-center gap-2">
          <Phone size={18} /> Contact Us
        </h3>
        <p>Email: hello@klaudcuts.com</p>
        <p>Phone: +234 801 234 5678</p>
        <p className="text-indigo-200 text-sm mt-4">
          © {new Date().getFullYear()} Klaud Cuts — All rights reserved.
        </p>
      </footer>
    </>
  );
};

export default LandingPage;
