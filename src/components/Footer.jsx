import React from "react";

const Footer = () => {
  return (
    <>
      <footer className="bg-gray-900 text-gray-300 p-6 mt-10 w-full">
        <div className="max-w-6xl mx-auto text-center space-y-2">
          <p>
            Disclaimer: All videos and pictures on FilmVerse are from the
            Internet, and their copyrights belong to the original creators. We
            only provide webpage services and do not store, record, or upload
            any content.
          </p>
          <p>
            Contact:{" "}
            <a href="mailto:contact@filmverse.com" className="text-blue-400">
              contact@filmverse.com
            </a>
          </p>
          <p>© {new Date().getFullYear()} FilmVerse. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
};

export default Footer;
