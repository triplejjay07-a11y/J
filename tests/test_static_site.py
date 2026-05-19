import re
import unittest
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
REQUIRED_PATHS = {
    "index.html",
    "privacy.html",
    "thanks.html",
    "robots.txt",
    "sitemap.xml",
    "css/styles.css",
    "js/main.js",
    "assets/favicon.svg",
    "assets/og-image.svg",
}


class ReferenceParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        for name in ("href", "src", "content"):
            value = attrs.get(name)
            if not value:
                continue
            if name == "content" and attrs.get("property") != "og:image":
                continue
            self.refs.append(value)


def is_local_reference(ref):
    parsed = urlparse(ref)
    return not parsed.scheme and not parsed.netloc and not ref.startswith("#")


def normalize_reference(ref):
    parsed = urlparse(ref)
    return parsed.path


class StaticSiteTests(unittest.TestCase):
    def test_required_deploy_paths_exist(self):
        for path in sorted(REQUIRED_PATHS):
            with self.subTest(path=path):
                self.assertTrue((ROOT / path).is_file(), f"Missing deploy path: {path}")

    def test_no_browser_download_suffix_filenames_remain(self):
        suffixed = [
            path.relative_to(ROOT).as_posix()
            for path in ROOT.rglob("*")
            if path.is_file()
            and ".git" not in path.parts
            and re.search(r"\[\d+\]", path.name)
        ]
        self.assertEqual([], suffixed)

    def test_html_local_references_exist(self):
        html_files = sorted(ROOT.glob("*.html"))
        self.assertTrue(html_files, "Expected deployable HTML files")

        missing = []
        for html_file in html_files:
            parser = ReferenceParser()
            parser.feed(html_file.read_text(encoding="utf-8"))
            for ref in parser.refs:
                if not is_local_reference(ref):
                    continue

                path = normalize_reference(ref)
                if not path:
                    continue

                target = (html_file.parent / path).resolve()
                if ROOT not in target.parents and target != ROOT:
                    missing.append((html_file.name, ref, "outside site root"))
                elif not target.exists():
                    missing.append((html_file.name, ref, path))

        self.assertEqual([], missing)

    def test_contact_form_script_prevents_default_get_submission(self):
        script = (ROOT / "js/main.js").read_text(encoding="utf-8")
        self.assertIn("event.preventDefault()", script)
        self.assertIn("consultation-form", script)


if __name__ == "__main__":
    unittest.main()
