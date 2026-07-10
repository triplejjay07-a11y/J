import re
import unittest
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse


ROOT = Path(__file__).resolve().parents[1]
REQUIRED_PUBLIC_PATHS = {
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
STALE_UPLOAD_PATHS = {
    "index[1].html",
    "privacy[1].html",
    "thanks[1].html",
    "robots[1].txt",
    "sitemap[1].xml",
    "styles.css",
}


class ReferenceParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        for attr in ("href", "src"):
            if attr in attrs:
                self.references.append((tag, attr, attrs[attr]))

        if tag == "meta" and attrs.get("property") == "og:image" and attrs.get("content"):
            self.references.append((tag, "content", attrs["content"]))


def is_local_reference(value):
    parsed = urlparse(value)
    return not parsed.scheme and not parsed.netloc and not value.startswith(("#", "mailto:", "tel:"))


def path_from_reference(html_file, value):
    parsed = urlparse(value)
    raw_path = unquote(parsed.path)
    if not raw_path:
        return None
    if raw_path.startswith("/"):
        return ROOT / raw_path.lstrip("/")
    return (html_file.parent / raw_path).resolve()


class StaticSiteDeployPathsTest(unittest.TestCase):
    def test_required_public_paths_exist(self):
        missing = sorted(path for path in REQUIRED_PUBLIC_PATHS if not (ROOT / path).exists())
        self.assertEqual(missing, [])

    def test_uploaded_browser_suffix_paths_are_not_deploy_targets(self):
        stale = sorted(path for path in STALE_UPLOAD_PATHS if (ROOT / path).exists())
        self.assertEqual(stale, [])

    def test_html_local_references_resolve(self):
        broken = []
        for html_file in sorted(ROOT.glob("*.html")):
            parser = ReferenceParser()
            parser.feed(html_file.read_text(encoding="utf-8"))

            for tag, attr, value in parser.references:
                if not is_local_reference(value):
                    continue

                resolved = path_from_reference(html_file, value)
                if resolved and not resolved.exists():
                    broken.append(f"{html_file.name}: <{tag} {attr}={value!r}> -> {resolved.relative_to(ROOT)}")

        self.assertEqual(broken, [])

    def test_public_html_does_not_reference_upload_suffixes(self):
        offenders = []
        pattern = re.compile(r"\[[0-9]+\]")
        for html_file in sorted(ROOT.glob("*.html")):
            if pattern.search(html_file.read_text(encoding="utf-8")):
                offenders.append(html_file.name)

        self.assertEqual(offenders, [])


if __name__ == "__main__":
    unittest.main()
