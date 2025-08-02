export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "header-max-length": [0, "always", Infinity], // Disables the header max length rule
    "subject-max-length": [0, "always", Infinity], // Disables the subject max length rule
    "body-max-line-length": [0, "always", Infinity], // Allows unlimited line length in the body
    "footer-max-line-length": [0, "always", Infinity], // Allows unlimited line length in the footer
  },
};
