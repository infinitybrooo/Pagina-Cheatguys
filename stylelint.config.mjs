export default {
    extends: ["stylelint-config-standard"],
    ignoreFiles: [
        "trash/**",
        "css/**/*.sprites-backup-*.css",
        "css/**/*.sprites-fallback-*.css"
    ],
    rules: {
        "alpha-value-notation": null,
        "at-rule-empty-line-before": null,
        "color-function-alias-notation": null,
        "color-function-notation": null,
        "color-hex-length": null,
        "comment-empty-line-before": null,
        "custom-property-empty-line-before": null,
        "declaration-block-no-redundant-longhand-properties": null,
        "declaration-block-no-shorthand-property-overrides": null,
        "declaration-block-single-line-max-declarations": null,
        "declaration-empty-line-before": null,
        "declaration-property-value-no-unknown": null,
        "font-family-name-quotes": null,
        "function-url-quotes": null,
        "hue-degree-notation": null,
        "keyframes-name-pattern": null,
        "length-zero-no-unit": null,
        "media-feature-range-notation": null,
        "no-descending-specificity": null,
        "no-duplicate-selectors": null,
        "number-max-precision": null,
        "property-no-vendor-prefix": null,
        "rule-empty-line-before": null,
        "selector-class-pattern": null,
        "selector-id-pattern": null,
        "selector-not-notation": null,
        "shorthand-property-no-redundant-values": null,
        "value-keyword-case": null,
        "value-no-vendor-prefix": null
    }
};
