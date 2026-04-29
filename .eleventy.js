const yaml = require("js-yaml");

module.exports = function (eleventyConfig) {
  eleventyConfig.addDataExtension("yml,yaml", (contents) => yaml.load(contents));

  eleventyConfig.addPassthroughCopy({ "assets": "assets" });
  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("llms.txt");
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });

  eleventyConfig.addCollection("portfolio", (api) =>
    api.getFilteredByGlob("src/_portfolio/*.md").sort((a, b) => {
      const ao = a.data.order ?? 999;
      const bo = b.data.order ?? 999;
      return ao - bo;
    })
  );

  eleventyConfig.addFilter("t", (obj, lang) => {
    if (obj == null) return "";
    if (typeof obj === "string") return obj;
    return obj[lang] ?? obj.en ?? Object.values(obj)[0] ?? "";
  });

  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
