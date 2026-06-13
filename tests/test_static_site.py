import unittest
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse


ROOT = Path(__file__).resolve().parents[1]
REQUIRED_DEPLOY_PATHS = {
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


class LocalReferenceParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = []

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)

        for attr in ("href", "src"):
            if attr in attributes:
                self.references.append(attributes[attr])

        if attributes.get("property") == "og:image" and "content" in attributes:
            self.references.append(attributes["content"])


def local_path(reference):
    parsed = urlparse(reference)

    if parsed.scheme or parsed.netloc:
        return None

    if parsed.path == "" or parsed.path.startswith("#"):
        return None

    return unquote(parsed.path.lstrip("/"))


class StaticSiteDeployPathTests(unittest.TestCase):
    def test_required_deploy_paths_exist(self):
        for deploy_path in REQUIRED_DEPLOY_PATHS:
            with self.subTest(deploy_path=deploy_path):
                self.assertTrue((ROOT / deploy_path).is_file())

    def test_uploaded_browser_suffix_paths_are_not_deploy_sources(self):
        suffixed_files = sorted(path.name for path in ROOT.glob("*[[]1[]].*"))
        self.assertEqual([], suffixed_files)

    def test_html_local_references_resolve(self):
        for html_path in sorted(ROOT.glob("*.html")):
            parser = LocalReferenceParser()
            parser.feed(html_path.read_text(encoding="utf-8"))

            for reference in parser.references:
                path = local_path(reference)
                if path is None:
                    continue

                with self.subTest(page=html_path.name, reference=reference):
                    self.assertTrue((ROOT / path).exists())


if __name__ == "__main__":
    unittest.main()
