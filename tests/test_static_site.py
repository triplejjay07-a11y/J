import unittest
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse


ROOT = Path(__file__).resolve().parents[1]


class LocalReferenceParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = []

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)

        for attribute in ("href", "src"):
            value = attributes.get(attribute)
            if value:
                self.references.append((attribute, value))

        if tag == "meta" and attributes.get("property") == "og:image":
            value = attributes.get("content")
            if value:
                self.references.append(("content", value))


def is_local_reference(value):
    parsed = urlparse(value)
    return parsed.scheme not in {"http", "https", "mailto", "tel", "data"} and not value.startswith("#")


def reference_target(html_file, value):
    parsed = urlparse(value)
    path = unquote(parsed.path)
    if not path:
        return None

    if path.startswith("/"):
        return ROOT / path.lstrip("/")

    return html_file.parent / path


class StaticSiteTests(unittest.TestCase):
    def test_required_deploy_paths_exist(self):
        required_paths = [
            "index.html",
            "privacy.html",
            "thanks.html",
            "robots.txt",
            "sitemap.xml",
            "css/styles.css",
            "js/main.js",
            "assets/favicon.svg",
            "assets/og-image.svg",
        ]

        for relative_path in required_paths:
            with self.subTest(path=relative_path):
                self.assertTrue((ROOT / relative_path).is_file())

    def test_uploaded_browser_suffix_files_are_not_deployed(self):
        suffixed_files = sorted(ROOT.glob("*[[]1[]].*"))
        self.assertEqual([], [path.name for path in suffixed_files])

    def test_html_local_references_exist(self):
        html_files = sorted(ROOT.glob("*.html"))
        self.assertTrue(html_files)

        missing = []
        for html_file in html_files:
            parser = LocalReferenceParser()
            parser.feed(html_file.read_text(encoding="utf-8"))

            for attribute, value in parser.references:
                if not is_local_reference(value):
                    continue

                target = reference_target(html_file, value)
                if target is not None and not target.exists():
                    missing.append(
                        f"{html_file.name} {attribute}={value} -> {target.relative_to(ROOT)}"
                    )

        self.assertEqual([], missing)


if __name__ == "__main__":
    unittest.main()
