import stylelint from "stylelint";

export const lintCss = async () => {
    const { output, errored, results } = await stylelint.lint({
        files: app.path.lint.scss,
        formatter: "string"
    });

    if (output && output.trim()) console.log(output);

    if (errored) {
        const failed = results.filter(r => r.errored);
        const summary = failed.map(r =>
            r.warnings
                .filter(w => w.severity === "error")
                .map(w => `  ${r.source}:${w.line}:${w.column}\n    ${w.text}`)
                .join("\n")
        ).join("\n");

        const error = new Error(
            `Stylelint: ${failed.length} file(s) failed, compilation skipped\n${summary}`
        );
        error.showStack = false;
        throw error;
    }
};
