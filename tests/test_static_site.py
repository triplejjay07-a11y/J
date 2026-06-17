import os
import unittest
from html.parser import HTMLParser
from urllib.parse import unquote, urlparse


ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


class LocalReferenceParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = []

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)

        for attribute in ("href", "src"):
            value = attributes.get(attribute)
            if value:
                self.references.append(value)

        if tag == "meta" and attributes.get("property") == "og:image":
            value = attributes.get("content")
            if value:
                self.references.append(value)


def is_local_reference(reference):
    parsed = urlparse(reference)
    return (
        not parsed.scheme
        and not parsed.netloc
        and not reference.startswith("#")
        and not reference.startswith("mailto:")
        and not reference.startswith("tel:")
    )


def reference_path(reference):
    parsed = urlparse(reference)
    return unquote(parsed.path)


class StaticSitePathsTest(unittest.TestCase):
    def test_required_deploy_paths_exist(self):
        required_paths = (
            "index.html",
            "privacy.html",
            "thanks.html",
            "robots.txt",
            "sitemap.xml",
            os.path.join("css", "styles.css"),
            os.path.join("js", "main.js"),
            os.path.join("assets", "favicon.svg"),
            os.path.join("assets", "og-image.svg"),
        )

        for path in required_paths:
            with self.subTest(path=path):
                self.assertTrue(os.path.isfile(os.path.join(ROOT, path)))

    def test_uploaded_browser_suffix_files_are_not_published(self):
        stale_paths = (
            "index[1].html",
            "privacy[1].html",
            "thanks[1].html",
            "robots[1].txt",
            "sitemap[1].xml",
            "styles.css",
        )

        for path in stale_paths:
            with self.subTest(path=path):
                self.assertFalse(os.path.exists(os.path.join(ROOT, path)))

    def test_html_local_references_resolve(self):
        pages = ("index.html", "privacy.html", "thanks.html")

        for page in pages:
            with open(os.path.join(ROOT, page), encoding="utf-8") as handle:
                parser = LocalReferenceParser()
                parser.feed(handle.read())

            for reference in parser.references:
                if not is_local_reference(reference):
                    continue

                path = reference_path(reference)
                if not path:
                    continue

                with self.subTest(page=page, reference=reference):
                    self.assertTrue(os.path.exists(os.path.join(ROOT, path)))


if __name__ == "__main__":
    unittest.main()
