# Changelog

All notable changes to the Glow Alchemy Studio website are documented here.

## [3.0.0] - Part 3 (Final POE)

### Added
- Full-width burgundy page banners on the home, services, gallery and contact pages
- Hero slideshow on the home page that fades between images every 5 seconds
- Gallery lightbox with close button, next/previous arrows and keyboard support
- Interactive map on the contact page (Leaflet.js) with a marker and popup
- Dynamic services content with live search and category filtering
- Enquiry form with text, dropdown, radio and checkbox controls, inline validation and an on-page response
- Contact form with validation and email sending
- Booking form with time-slot selection, date validation and a confirmation summary
- `robots.txt` and `sitemap.xml` for search engine crawling
- Unique title tags, meta descriptions and meta keywords on every page

### Changed
- Rebranded from "Gilded Nails" to "Glow Alchemy Studio" across all pages
- Moved the studio name into the header as the logo
- Redesigned the index page with services on the left and an image on the right
- Redesigned the contact page into split image and text sections
- Reordered the gallery intro text and centred it
- Renamed pages and image files to lowercase hyphenated names for deployment
- Updated all navigation and footer links to the new file names

### Fixed
- Fixed the invalid `h1,\nh2...` selector in style.css so heading styles apply
- Linked the external stylesheet that was missing from the HTML pages
- Fixed the malformed cart link in the header

### Removed
- Cart icon and cart link from the header
- Contact Us section from the index page
- Unused CSS rules, including the fragile sibling selector for the contact clipping

## [2.0.0] - Part 2 (Feedback Edits)

### Changed
-
### Added
- External stylesheet (style.css) with a colour palette set up as CSS variables
- Responsive breakpoints at 480px, 768px and 1024px
- Typography with Playfair Display and Inter
- Footer using CSS Grid with grid-template-areas

## [1.0.0] - Part 1

### Added
- Initial HTML structure for the home, services, gallery, booking and contact pages
- Site content, navigation and images