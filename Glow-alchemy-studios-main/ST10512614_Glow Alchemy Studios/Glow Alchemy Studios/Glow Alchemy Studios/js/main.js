// Configuration
const SALON_NAME = "Glow Alchemy Studio";
const MAP_COORDS = [-26.2041, 28.0473];
const MAP_ZOOM = 15;
const EMAILJS_SERVICE_ID = "YOUR_EMAILJS_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "YOUR_EMAILJS_TEMPLATE_ID";
const EMAILJS_PUBLIC_KEY = "YOUR_EMAILJS_PUBLIC_KEY";
const SALON_ADDRESS = "123 Glow Street, Beautyville, Glamourland";

document.addEventListener("DOMContentLoaded", () => {
  const heroSlides = [...document.querySelectorAll(".hero-banner .hero-slide")];
  if (heroSlides.length > 1) {
    let activeSlideIndex = Math.max(
      0,
      heroSlides.findIndex((slide) => slide.classList.contains("is-active"))
    );

    const showHeroSlide = (index) => {
      heroSlides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === index;
        slide.classList.toggle("is-active", isActive);
        slide.setAttribute("aria-hidden", String(!isActive));
      });
    };

    showHeroSlide(activeSlideIndex);
    window.setInterval(() => {
      activeSlideIndex = (activeSlideIndex + 1) % heroSlides.length;
      showHeroSlide(activeSlideIndex);
    }, 5000);
  }

  // Shared helpers
  const readStoredValue = (key, fallback) => {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch (error) {
      console.error(`Unable to read ${key} from localStorage.`, error);
      return fallback;
    }
  };

  const saveStoredValue = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Unable to save ${key} to localStorage.`, error);
      return false;
    }
  };

  const saveSubmission = (key, submission) => {
    const savedSubmissions = readStoredValue(key, []);
    const submissions = Array.isArray(savedSubmissions) ? savedSubmissions : [];
    return saveStoredValue(key, [...submissions, submission]);
  };

  const getFieldErrorElement = (field) => {
    const container = field.closest(".form-group") || field.parentElement;
    if (!container) {
      return null;
    }

    let errorElement = container.querySelector(".error-message");
    if (!errorElement) {
      errorElement = document.createElement("span");
      errorElement.className = "error-message";
      container.append(errorElement);
    }
    errorElement.setAttribute("aria-live", "polite");

    if (!errorElement.id) {
      errorElement.id = `error-${field.id || Math.random().toString(36).slice(2)}`;
    }

    const describedBy = new Set((field.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean));
    describedBy.add(errorElement.id);
    field.setAttribute("aria-describedby", [...describedBy].join(" "));
    return errorElement;
  };

  const setFieldError = (field, message) => {
    const errorElement = getFieldErrorElement(field);
    if (!errorElement) {
      return;
    }
    errorElement.textContent = message;
    field.setAttribute("aria-invalid", message ? "true" : "false");
  };

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  const validateSouthAfricanPhone = (value) => {
    const normalizedPhone = value.replace(/[\s()-]/g, "");
    return /^(?:0\d{9}|\+27\d{9})$/.test(normalizedPhone);
  };

  // Shared feature styling
  const featureStyles = document.createElement("style");
  featureStyles.textContent = `
    .fade-in { opacity: 0; transform: translateY(16px); transition: opacity 500ms ease, transform 500ms ease; }
    .fade-in.is-visible { opacity: 1; transform: translateY(0); }
    .gallery-lightbox { position: fixed; inset: 0; z-index: 9999; display: grid; place-items: center; padding: 1rem; background: rgb(0 0 0 / 88%); }
    .gallery-lightbox-content { position: relative; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 1rem; max-width: 100%; }
    .gallery-lightbox-image { grid-column: 1 / -1; grid-row: 1; max-width: min(90vw, 1100px); max-height: 78vh; object-fit: contain; justify-self: center; }
    .gallery-lightbox-caption { grid-column: 1 / -1; margin: 0; color: #fff; text-align: center; }
    .gallery-lightbox-close { position: absolute; z-index: 1; top: .5rem; right: .5rem; }
    .gallery-lightbox-previous, .gallery-lightbox-next, .gallery-lightbox-close { min-width: 2.75rem; min-height: 2.75rem; border: 0; border-radius: .25rem; color: #111; background: #fff; font-size: 1.5rem; cursor: pointer; }
    .gallery-lightbox-previous { grid-column: 1; grid-row: 1; }
    .gallery-lightbox-next { grid-column: 3; grid-row: 1; }
    .lightbox-open { overflow: hidden; }
    #back-to-top { position: fixed; right: 1rem; bottom: 1rem; z-index: 1000; }
    @media (prefers-reduced-motion: reduce) { .fade-in { transition: none; } }
  `;
  document.head.append(featureStyles);

  // Mobile navigation
  const navToggle = document.querySelector(".nav-toggle");
  const navigation = document.querySelector("header nav, nav");
  if (navToggle && navigation) {
    const closeNavigation = () => {
      navigation.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    };

    navToggle.setAttribute("aria-expanded", navigation.classList.contains("open") ? "true" : "false");
    navToggle.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navigation.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest("a")) {
        closeNavigation();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navigation.classList.contains("open")) {
        closeNavigation();
        navToggle.focus();
      }
    });
  }

  // FAQ accordion
  const faqItems = document.querySelectorAll(".faq-item");
  if (faqItems.length) {
    const faqButtons = [...faqItems].map((item) =>
      item.matches("button") ? item : item.querySelector("button")
    ).filter(Boolean);

    faqButtons.forEach((button) => {
      const item = button.matches(".faq-item") ? button : button.closest(".faq-item");
      const answer = item?.querySelector(".faq-answer, [data-faq-answer]") ||
        button.nextElementSibling;
      if (!answer) {
        return;
      }

      answer.hidden = button.getAttribute("aria-expanded") !== "true";
      button.setAttribute("aria-expanded", String(!answer.hidden));
      button.addEventListener("click", () => {
        const shouldOpen = button.getAttribute("aria-expanded") !== "true";
        faqButtons.forEach((otherButton) => {
          if (otherButton === button) {
            return;
          }
          const otherItem = otherButton.matches(".faq-item") ? otherButton : otherButton.closest(".faq-item");
          const otherAnswer = otherItem?.querySelector(".faq-answer, [data-faq-answer]") ||
            otherButton.nextElementSibling;
          if (otherAnswer) {
            otherAnswer.hidden = true;
            otherButton.setAttribute("aria-expanded", "false");
          }
        });
        answer.hidden = !shouldOpen;
        button.setAttribute("aria-expanded", String(shouldOpen));
      });
    });
  }

  // Gallery filters and lightbox
  const galleryItems = [...document.querySelectorAll(".gallery-item")];
  const filterButtons = [...document.querySelectorAll(".filter-btn")];
  if (galleryItems.length && filterButtons.length) {
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const selectedFilter = button.dataset.filter;
        galleryItems.forEach((item) => {
          const matches = selectedFilter === "all" || item.dataset.category === selectedFilter;
          item.hidden = !matches;
        });
        filterButtons.forEach((filterButton) => {
          filterButton.setAttribute("aria-pressed", String(filterButton === button));
        });
      });
    });
  }

  const galleryImages = galleryItems.flatMap((item) => {
    const image = item.querySelector("img");
    return image ? [{ image, item }] : [];
  });

  if (galleryImages.length) {
    let lightbox = null;
    let activeImageIndex = 0;
    let previouslyFocusedElement = null;

    const getVisibleImages = () => galleryImages.filter(({ item }) => !item.hidden);

    const updateLightboxImage = (imageIndex) => {
      const visibleImages = getVisibleImages();
      if (!visibleImages.length || !lightbox) {
        closeLightbox();
        return;
      }
      activeImageIndex = (imageIndex + visibleImages.length) % visibleImages.length;
      const { image } = visibleImages[activeImageIndex];
      const lightboxImage = lightbox.querySelector(".gallery-lightbox-image");
      const caption = lightbox.querySelector(".gallery-lightbox-caption");
      lightboxImage.src = image.dataset.fullSrc || image.currentSrc || image.src;
      lightboxImage.alt = image.alt || "Gallery image";
      caption.textContent = image.alt || "";
      lightbox.querySelector(".gallery-lightbox-previous").disabled = visibleImages.length < 2;
      lightbox.querySelector(".gallery-lightbox-next").disabled = visibleImages.length < 2;
    };

    const closeLightbox = () => {
      if (!lightbox) {
        return;
      }
      lightbox.remove();
      lightbox = null;
      document.body.classList.remove("lightbox-open");
      previouslyFocusedElement?.focus();
    };

    const createLightbox = () => {
      lightbox = document.createElement("div");
      lightbox.className = "gallery-lightbox";
      lightbox.setAttribute("role", "dialog");
      lightbox.setAttribute("aria-modal", "true");
      lightbox.setAttribute("aria-label", "Image gallery");

      const content = document.createElement("div");
      content.className = "gallery-lightbox-content";

      const closeButton = document.createElement("button");
      closeButton.className = "gallery-lightbox-close";
      closeButton.type = "button";
      closeButton.setAttribute("aria-label", "Close image");
      closeButton.textContent = "×";

      const previousButton = document.createElement("button");
      previousButton.className = "gallery-lightbox-previous";
      previousButton.type = "button";
      previousButton.setAttribute("aria-label", "Previous image");
      previousButton.textContent = "‹";

      const nextButton = document.createElement("button");
      nextButton.className = "gallery-lightbox-next";
      nextButton.type = "button";
      nextButton.setAttribute("aria-label", "Next image");
      nextButton.textContent = "›";

      const image = document.createElement("img");
      image.className = "gallery-lightbox-image";

      const caption = document.createElement("p");
      caption.className = "gallery-lightbox-caption";

      content.append(closeButton, previousButton, image, nextButton, caption);
      lightbox.append(content);
      document.body.append(lightbox);
      document.body.classList.add("lightbox-open");

      closeButton.addEventListener("click", closeLightbox);
      previousButton.addEventListener("click", () => updateLightboxImage(activeImageIndex - 1));
      nextButton.addEventListener("click", () => updateLightboxImage(activeImageIndex + 1));
      lightbox.addEventListener("click", (event) => {
        if (event.target === lightbox) {
          closeLightbox();
        }
      });
      lightbox.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          closeLightbox();
          return;
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          updateLightboxImage(activeImageIndex - 1);
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          updateLightboxImage(activeImageIndex + 1);
        } else if (event.key === "Tab") {
          const focusableElements = [...lightbox.querySelectorAll("button:not(:disabled)")];
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];
          if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      });
      closeButton.focus();
    };

    galleryImages.forEach(({ image }) => {
      image.addEventListener("click", () => {
        const visibleImages = getVisibleImages();
        const clickedIndex = visibleImages.findIndex(({ image: visibleImage }) => visibleImage === image);
        if (clickedIndex < 0) {
          return;
        }
        previouslyFocusedElement = image;
        createLightbox();
        updateLightboxImage(clickedIndex);
      });
    });
  }

  // Dynamic services search and category filtering
  const servicesContainer = document.querySelector("#services-container");
  const serviceSearch = document.querySelector("#service-search");
  const serviceCategory = document.querySelector("#service-category");
  if (servicesContainer) {
    const services = [
      { name: "Classic Manicure", category: "manicure", price: 280, duration: 45, description: "A tidy, classic manicure with your choice of polish." },
      { name: "Gel Polish", category: "gel", price: 350, duration: 60, description: "Long-lasting gel colour with a glossy finish." },
      { name: "Gel Pedicure", category: "pedicure", price: 420, duration: 75, description: "A relaxing pedicure finished with durable gel polish." },
      { name: "Acrylic Extensions", category: "extensions", price: 550, duration: 120, description: "Custom-shaped acrylic extensions finished to your style." },
      { name: "Custom Nail Art", category: "nail-art", price: 150, duration: 45, description: "Personalised details and designs, priced from R150." },
      { name: "Soak Off", category: "extras", price: 100, duration: 30, description: "Careful removal of existing gel or acrylic product." }
    ];
    let countElement = document.querySelector("#service-results-count");
    let emptyElement = document.querySelector("#service-no-results");

    if (!countElement) {
      countElement = document.createElement("p");
      countElement.id = "service-results-count";
      countElement.setAttribute("aria-live", "polite");
      servicesContainer.before(countElement);
    }
    if (!emptyElement) {
      emptyElement = document.createElement("p");
      emptyElement.id = "service-no-results";
      emptyElement.textContent = "No services match your search.";
      emptyElement.hidden = true;
      servicesContainer.after(emptyElement);
    }

    if (serviceCategory && ![...serviceCategory.options].some((option) => option.value === "all")) {
      const allOption = document.createElement("option");
      allOption.value = "all";
      allOption.textContent = "All services";
      serviceCategory.prepend(allOption);
      serviceCategory.value = "all";
    }

    const renderServices = () => {
      const searchTerm = serviceSearch?.value.trim().toLowerCase() || "";
      const selectedCategory = serviceCategory?.value || "all";
      const filteredServices = services.filter((service) => {
        const matchesSearch = `${service.name} ${service.category} ${service.description}`.toLowerCase().includes(searchTerm);
        const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
        return matchesSearch && matchesCategory;
      });

      servicesContainer.replaceChildren();
      filteredServices.forEach((service) => {
        const card = document.createElement("article");
        card.className = "service-card";

        const title = document.createElement("h3");
        title.textContent = service.name;
        const description = document.createElement("p");
        description.textContent = service.description;
        const details = document.createElement("p");
        details.textContent = `R${service.price} · ${service.duration} minutes`;
        const addButton = document.createElement("button");
        addButton.type = "button";
        addButton.className = "add-to-cart";
        addButton.dataset.service = service.name;
        addButton.textContent = "Add to cart";
        card.append(title, description, details, addButton);
        servicesContainer.append(card);
      });

      countElement.textContent = `${filteredServices.length} ${filteredServices.length === 1 ? "service" : "services"} found`;
      emptyElement.hidden = filteredServices.length > 0;
    };

    serviceSearch?.addEventListener("input", renderServices);
    serviceCategory?.addEventListener("change", renderServices);
    renderServices();
  }

  // Interactive map
  const mapElement = document.querySelector("#map");
  if (mapElement) {
    if (!window.L) {
      console.error("The map container exists, but Leaflet.js is not loaded.");
    } else {
      const map = window.L.map(mapElement).setView(MAP_COORDS, MAP_ZOOM);
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${MAP_COORDS[0]},${MAP_COORDS[1]}`;
      const popup = `<strong>${SALON_NAME}</strong><br>${SALON_ADDRESS}<br><a href="${directionsUrl}" target="_blank" rel="noopener noreferrer">Get directions</a>`;
      window.L.marker(MAP_COORDS).addTo(map).bindPopup(popup);
    }
  }

  // Enquiry form validation and local confirmation
  const enquiryForm = document.querySelector("#enquiry-form");
  if (enquiryForm) {
    const fields = {
      name: enquiryForm.querySelector("#enq-name"),
      email: enquiryForm.querySelector("#enq-email"),
      phone: enquiryForm.querySelector("#enq-phone"),
      service: enquiryForm.querySelector("#enq-service"),
      message: enquiryForm.querySelector("#enq-message"),
      consent: enquiryForm.querySelector("#enq-consent")
    };
    const contactMethodInputs = [...enquiryForm.querySelectorAll('input[name="contact-method"]')];
    const response = document.querySelector("#enquiry-response");

    const validateEnquiryField = (fieldName) => {
      const field = fields[fieldName];
      if (!field) {
        return false;
      }
      let error = "";
      const value = field.type === "checkbox" ? field.checked : field.value.trim();
      if (!value) {
        error = fieldName === "consent" ? "Please provide consent to continue." : "This field is required.";
      } else if (fieldName === "email" && !validateEmail(field.value)) {
        error = "Enter a valid email address.";
      } else if (fieldName === "phone" && !validateSouthAfricanPhone(field.value)) {
        error = "Enter a valid South African number (10 digits starting with 0 or +27).";
      } else if (fieldName === "message" && field.value.trim().length < 10) {
        error = "Please enter at least 10 characters.";
      }
      setFieldError(field, error);
      return !error;
    };

    Object.entries(fields).forEach(([fieldName, field]) => {
      if (!field) {
        return;
      }
      field.addEventListener("blur", () => validateEnquiryField(fieldName));
      field.addEventListener("input", () => validateEnquiryField(fieldName));
      field.addEventListener("change", () => validateEnquiryField(fieldName));
    });
    contactMethodInputs.forEach((input) => {
      input.addEventListener("change", () => {
        contactMethodInputs.forEach((radio) => setFieldError(radio, ""));
      });
    });

    enquiryForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const validFields = Object.keys(fields).map(validateEnquiryField);
      const selectedContactMethod = contactMethodInputs.find((input) => input.checked);
      const radioAnchor = contactMethodInputs[0];
      if (radioAnchor) {
        setFieldError(radioAnchor, selectedContactMethod ? "" : "Choose a preferred contact method.");
      }
      if (!validFields.every(Boolean) || !selectedContactMethod) {
        return;
      }

      const selectedService = fields.service.options[fields.service.selectedIndex]?.textContent.trim() || fields.service.value;
      const submission = {
        name: fields.name.value.trim(),
        email: fields.email.value.trim(),
        phone: fields.phone.value.trim(),
        service: fields.service.value,
        contactMethod: selectedContactMethod.value,
        message: fields.message.value.trim(),
        submittedAt: new Date().toISOString()
      };
      saveSubmission("glowAlchemyEnquiries", submission);
      if (response) {
        response.textContent = `Thank you, ${submission.name}! We’ve noted your enquiry about ${selectedService}. We’ll contact you by ${selectedContactMethod.value} and reply within 24 hours.`;
        response.setAttribute("role", "status");
      }
      enquiryForm.reset();
      Object.values(fields).filter(Boolean).forEach((field) => setFieldError(field, ""));
      contactMethodInputs.forEach((radio) => setFieldError(radio, ""));
    });
  }

  // Contact form validation and EmailJS delivery
  const contactForm = document.querySelector("#contact-form");
  if (contactForm) {
    const fields = {
      name: contactForm.querySelector("#c-name"),
      email: contactForm.querySelector("#c-email"),
      subject: contactForm.querySelector("#c-subject"),
      message: contactForm.querySelector("#c-message")
    };
    const status = document.querySelector("#contact-status");
    const submitButton = contactForm.querySelector('[type="submit"]');

    const validateContactField = (fieldName) => {
      const field = fields[fieldName];
      if (!field) {
        return false;
      }
      let error = "";
      if (!field.value.trim()) {
        error = "This field is required.";
      } else if (fieldName === "email" && !validateEmail(field.value)) {
        error = "Enter a valid email address.";
      } else if (fieldName === "message" && field.value.trim().length < 10) {
        error = "Please enter at least 10 characters.";
      }
      setFieldError(field, error);
      return !error;
    };

    Object.entries(fields).forEach(([fieldName, field]) => {
      if (!field) {
        return;
      }
      field.addEventListener("blur", () => validateContactField(fieldName));
      field.addEventListener("input", () => validateContactField(fieldName));
      field.addEventListener("change", () => validateContactField(fieldName));
    });

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!Object.keys(fields).map(validateContactField).every(Boolean)) {
        return;
      }
      if (!window.emailjs || typeof window.emailjs.send !== "function") {
        if (status) {
          status.textContent = "Email delivery is unavailable right now. Please try again later.";
          status.setAttribute("role", "alert");
        }
        console.error("EmailJS is not loaded. Load the EmailJS browser SDK before submitting the contact form.");
        return;
      }

      const originalButtonText = submitButton?.textContent || "";
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
      }
      if (status) {
        status.textContent = "Sending...";
        status.setAttribute("role", "status");
      }

      try {
        await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          from_name: fields.name.value.trim(),
          reply_to: fields.email.value.trim(),
          subject: fields.subject.value.trim(),
          message: fields.message.value.trim()
        }, EMAILJS_PUBLIC_KEY);
        if (status) {
          status.textContent = "Thanks for getting in touch. Your message has been sent.";
          status.setAttribute("role", "status");
        }
        contactForm.reset();
        Object.values(fields).filter(Boolean).forEach((field) => setFieldError(field, ""));
      } catch (error) {
        console.error("Unable to send the contact form with EmailJS.", error);
        if (status) {
          status.textContent = "We couldn’t send your message. Please try again or contact the salon directly.";
          status.setAttribute("role", "alert");
        }
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        }
      }
    });

    // To use Formspree instead, replace emailjs.send(...) with a fetch POST to your Formspree endpoint.
  }

  // Booking form date, time-slot, and contact validation
  const bookingForm = document.querySelector("#booking-form");
  if (bookingForm) {
    const fields = {
      service: bookingForm.querySelector("#service"),
      date: bookingForm.querySelector("#date"),
      time: bookingForm.querySelector("#selected-time"),
      name: bookingForm.querySelector("#name"),
      phone: bookingForm.querySelector("#phone"),
      email: bookingForm.querySelector("#email")
    };
    const timeSlots = [...bookingForm.querySelectorAll(".time-slot")];
    const confirmation = document.querySelector("#confirmation");
    const today = new Date();
    const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    if (fields.date) {
      fields.date.min = localToday;
      fields.date.addEventListener("change", () => validateBookingField("date"));
    }

    const validateBookingField = (fieldName) => {
      const field = fields[fieldName];
      if (!field) {
        return false;
      }
      let error = "";
      if (!field.value.trim()) {
        error = fieldName === "time" ? "Please choose a time." : "This field is required.";
      } else if (fieldName === "date" && field.value < localToday) {
        error = "Choose today or a future date.";
      } else if (fieldName === "phone" && !validateSouthAfricanPhone(field.value)) {
        error = "Enter a valid South African number (10 digits starting with 0 or +27).";
      } else if (fieldName === "email" && !validateEmail(field.value)) {
        error = "Enter a valid email address.";
      }
      setFieldError(field, error);
      return !error;
    };

    Object.entries(fields).forEach(([fieldName, field]) => {
      if (!field) {
        return;
      }
      field.addEventListener("blur", () => validateBookingField(fieldName));
      field.addEventListener("input", () => validateBookingField(fieldName));
      field.addEventListener("change", () => validateBookingField(fieldName));
    });

    timeSlots.forEach((button) => {
      button.addEventListener("click", () => {
        timeSlots.forEach((slot) => {
          slot.classList.toggle("selected", slot === button);
          slot.setAttribute("aria-pressed", String(slot === button));
        });
        if (fields.time) {
          fields.time.value = button.dataset.time || button.textContent.trim();
          validateBookingField("time");
        }
      });
    });

    bookingForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!Object.keys(fields).map(validateBookingField).every(Boolean)) {
        return;
      }

      const serviceLabel = fields.service.options[fields.service.selectedIndex]?.textContent.trim() || fields.service.value;
      const booking = {
        service: fields.service.value,
        date: fields.date.value,
        time: fields.time.value,
        name: fields.name.value.trim(),
        phone: fields.phone.value.trim(),
        email: fields.email.value.trim(),
        notes: bookingForm.querySelector("#notes")?.value.trim() || "",
        submittedAt: new Date().toISOString()
      };
      saveSubmission("glowAlchemyBookings", booking);
      if (confirmation) {
        confirmation.classList.remove("hidden");
        confirmation.textContent = `You're booked, ${booking.name}! ${serviceLabel} on ${booking.date} at ${booking.time}. We look forward to seeing you.`;
        confirmation.setAttribute("role", "status");
      }
      bookingForm.reset();
      timeSlots.forEach((slot) => {
        slot.classList.remove("selected");
        slot.setAttribute("aria-pressed", "false");
      });
      if (fields.date) {
        fields.date.min = localToday;
      }
      Object.values(fields).filter(Boolean).forEach((field) => setFieldError(field, ""));
    });
  }

  // Section fade-in
  const observedSections = document.querySelectorAll("section");
  if ("IntersectionObserver" in window && observedSections.length) {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      observedSections.forEach((section) => section.classList.add("is-visible"));
    } else {
      const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      observedSections.forEach((section) => {
        section.classList.add("fade-in");
        sectionObserver.observe(section);
      });
    }
  }

  // Back-to-top control
  let backToTopButton = document.querySelector("#back-to-top");
  if (!backToTopButton) {
    backToTopButton = document.createElement("button");
    backToTopButton.id = "back-to-top";
    backToTopButton.type = "button";
    backToTopButton.textContent = "Back to top";
    backToTopButton.setAttribute("aria-label", "Back to top");
    backToTopButton.hidden = true;
    document.body.append(backToTopButton);
  }
  backToTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  const updateBackToTopVisibility = () => {
    backToTopButton.hidden = window.scrollY < 400;
  };
  window.addEventListener("scroll", updateBackToTopVisibility, { passive: true });
  updateBackToTopVisibility();

  // Persistent cart counter
  const cartCountElements = [...document.querySelectorAll(".cart-count")];
  if (cartCountElements.length || document.querySelector(".add-to-cart")) {
    const storedCount = readStoredValue("glowAlchemyCartCount", 0);
    let cartCount = Number.isInteger(storedCount) && storedCount >= 0 ? storedCount : 0;
    const updateCartCount = () => {
      cartCountElements.forEach((element) => {
        element.textContent = String(cartCount);
      });
    };
    updateCartCount();

    document.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }
      const addButton = event.target.closest(".add-to-cart");
      if (!addButton) {
        return;
      }
      cartCount += 1;
      updateCartCount();
      saveStoredValue("glowAlchemyCartCount", cartCount);
    });
  }
});
