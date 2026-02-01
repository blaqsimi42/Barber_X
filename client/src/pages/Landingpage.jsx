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
    [story1Ref.current, story2Ref.current].forEach((el) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, y: 60, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
          },
        },
      );
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
      <section
        id="hero"
        className="min-h-screen flex flex-col justify-center items-center text-center bg-[#faf9f7] relative overflow-hidden p-4 md:p-4 lg:p-8"
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
              Explore Cuts →
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

      <section
        id="cuts"
        ref={cutsDivRef}
        className=" bg-white overflow-hidden w-full sm:h-[160rem] md:h-190 lg:min-h-screen"
      >
        <div ref={cutsInnerRef}>
          <div className="text-center mb-2 w-full">
            <h2 className="text-4xl font-bold text-indigo-600">
              Our Signature Cuts
            </h2>
            <p className="text-gray-500 text-lg">
              Handpicked styles loved by our clients
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-[80vh]">
              <Loader className="animate-spin w-10 h-10 text-indigo-600" />
            </div>
          ) : isError ? (
            <p className="text-center text-red-500">Failed to load cuts</p>
          ) : cuts?.data?.length === 0 ? (
            <p className="text-center text-gray-500">No cuts available yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 px-10 lg:px-16">
              {cuts.data.slice(0, 3).map((cut, i) => (
                <div
                  key={cut._id}
                  ref={(el) => (cutsGridRef.current[i] = el)}
                  className="bg-white rounded-3xl shadow-lg overflow-hidden border border-indigo-100 flex flex-col justify-between group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 mb-2"
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
                      {/* Mobile: Book button, Desktop: style name */}
                      <Link
                        to="/showcase"
                        className="text-gray-500 text-sm italic md:hidden bg-indigo-600 text-white px-4 py-1 rounded-lg hover:bg-indigo-700 transition-all"
                      >
                        Book
                      </Link>
                      <span className="hidden md:inline text-gray-500 text-sm italic">
                        {cut.name}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex justify-center  w-full">
                <div className=" mt-2 md:ml-150 lg:ml-186">
                  <Link
                    to="/showcase"
                    className="inline-flex items-center justify-center gap-2 bg-white text-indigo-600 px-8 py-3 rounded-full font-semibold text-lg shadow-lg border-2 border-indigo-500 hover:bg-indigo-50 hover:scale-105 transition-all duration-300 "
                  >
                    Book
                    <ArrowRight />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

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
              className={`flex flex-col md:flex-row ml-12 justify-center items-center gap-12 mb-20 w-3/4 ${
                story.imagePosition === "left" ? "" : "md:flex-row-reverse"
              }`}
            >
              <div className="md:w-2/2">
                <img
                  src={story.image}
                  alt={story.title}
                  className="rounded-2xl shadow-2xl object-cover w-full h-96"
                />
              </div>
              <div className="md:w-1/2 lg:w-30px text-white space-y-4">
                <span className="text-indigo-500 font-bold text-xs tracking-[0.3em] uppercase">
                  Chapter {index === 0 ? "01" : "02"}
                </span>
                <h3 className="text-3xl md:text-5xl font-bold">
                  {story.title}
                </h3>
                <p className="text-gray-300 text-lg md:text-xl">{story.text}</p>
              </div>
            </div>
          );
        })}
      </section>

      <section
        id="location"
        className="relative h-screen bg-linear-to-br from-white via-indigo-50 to-white overflow-hidden"
      >
        <div className="flex items-center justify-center h-full px-4 md:px-8">
          <div
            ref={locationCardRef}
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border-2 border-indigo-100 text-center space-y-4"
          >
            <div className="flex justify-center">
              <div className="bg-indigo-600 rounded-full p-5 shadow-md">
                <MapPin size={42} className="text-white" />
              </div>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
              Visit Our Shop
            </h3>
            <p className="text-lg text-gray-700 font-medium">
              12 Kings Avenue, Lekki Phase 1, Lagos, Nigeria
            </p>
            {/* New Working Hours */}
            <div className="flex justify-between mt-4 text-gray-600 font-medium">
              <span>Working Hours:</span>
              <span>9:00 AM</span>
            </div>
            <div className="flex justify-between text-gray-600 font-medium">
              <span>Closing Hours:</span>
              <span>8:00 PM</span>
            </div>
            <div className="flex justify-between text-gray-600 font-medium">
              <span>Booking Hours:</span>
              <span>5:00 AM</span>
            </div>
          </div>
        </div>
      </section>

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
