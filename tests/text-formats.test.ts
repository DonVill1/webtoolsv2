import { describe, expect, it } from "vitest";
import { convertText, parseCsv } from "@/lib/tools/text-formats";

describe("CSV parser", () => {
  it("reads headers and rows", () => {
    expect(parseCsv("name,role\nAda,Mathematician\nGrace,Engineer")).toEqual([
      ["name", "role"],
      ["Ada", "Mathematician"],
      ["Grace", "Engineer"],
    ]);
  });

  it("keeps commas, quotes and newlines inside quoted fields", () => {
    const rows = parseCsv('id,note\n1,"Hello, world"\n2,"He said ""hi""\nand left"');
    expect(rows[0]).toEqual(["id", "note"]);
    expect(rows[1]).toEqual(["1", "Hello, world"]);
    expect(rows[2]).toEqual(["2", 'He said "hi"\nand left']);
  });

  it("strips a byte-order mark", () => {
    expect(parseCsv("\uFEFFa,b\n1,2")[0]).toEqual(["a", "b"]);
  });
});

describe("text conversion", () => {
  it("converts JSON to YAML and back", () => {
    const json = '{"name":"Ada","born":1815,"skills":["maths","writing"]}';
    const yaml = convertText(json, "json", "yaml");
    expect(yaml.error).toBeNull();
    expect(yaml.output).toContain("name: Ada");

    const back = convertText(yaml.output, "yaml", "json");
    expect(back.error).toBeNull();
    expect(JSON.parse(back.output)).toEqual({ name: "Ada", born: 1815, skills: ["maths", "writing"] });
  });

  it("converts CSV to JSON records", () => {
    const result = convertText("name,score\nAda,10\nGrace,9", "csv", "json");
    expect(result.error).toBeNull();
    expect(JSON.parse(result.output)).toEqual([
      { name: "Ada", score: "10" },
      { name: "Grace", score: "9" },
    ]);
  });

  it("quotes CSV cells that contain separators", () => {
    const result = convertText('{"name":"Ada, Countess","note":"said \\"hello\\""}', "json", "csv");
    expect(result.error).toBeNull();
    expect(result.output).toContain('"Ada, Countess"');
    expect(result.output).toContain('"said ""hello"""');
  });

  it("converts JSON to XML with a root element", () => {
    const result = convertText('{"person":{"name":"Ada","born":1815}}', "json", "xml");
    expect(result.error).toBeNull();
    expect(result.output).toContain("<?xml");
    expect(result.output).toContain("<person>");
    expect(result.output).toContain("<name>Ada</name>");
  });

  it("renders Markdown to HTML", () => {
    const result = convertText("# Title\n\nA **bold** claim.", "markdown", "html");
    expect(result.error).toBeNull();
    expect(result.output).toContain("<h1>Title</h1>");
    expect(result.output).toContain("<strong>bold</strong>");
  });

  it("reports parse and unsupported-conversion errors instead of guessing", () => {
    expect(convertText("{not json}", "json", "yaml").error).toMatch(/JSON/i);
    expect(convertText("plain words", "text", "json").error).toMatch(/not supported/);
  });

  it("returns empty output for empty input", () => {
    expect(convertText("   ", "json", "yaml")).toEqual({ output: "", error: null });
  });
});
