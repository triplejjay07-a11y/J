from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse


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

REFERENCE_ATTRS = {
    "a": {"href"},
    "link": {"href"},
    "script": {"src"},
    "img": {"src"},
    "source": {"src", "srcset"},
    "meta": {"content"},
}

LOCAL_CONTENT_PROPERTIES = {"og:image", "twitter:image"}
IGNORED_SCHEMES = {"http", "https", "mailto", "tel", "sms", "data", "javascript"}


class ReferenceParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = []

    def handle_starttag(self, tag, attrs):
        attr_map = dict(attrs)
        for attr in REFERENCE_ATTRS.get(tag, set()):
            value = attr_map.get(attr)
            if not value:
                continue
            if tag == "meta" and attr == "content":
                property_name = attr_map.get("property") or attr_map.get("name")
                if property_name not in LOCAL_CONTENT_PROPERTIES:
                    continue
            self.references.append(value)


def local_path(reference):
    first_reference = reference.split(",", 1)[0].strip().split(" ", 1)[0]
    if not first_reference or first_reference.startswith("#"):
        return None

    parsed = urlparse(first_reference)
    if parsed.scheme in IGNORED_SCHEMES or parsed.netloc:
        return None

    path = unquote(parsed.path).lstrip("/")
    return path or "index.html"


def test_required_deploy_paths_exist():
    missing = sorted(path for path in REQUIRED_PATHS if not (ROOT / path).is_file())
    assert not missing, f"Missing deploy paths: {missing}"


def test_uploaded_browser_suffixes_are_not_deploy_sources():
    suffixed = sorted(path.name for path in ROOT.glob("*[[]1[]]*"))
    assert not suffixed, f"Browser-suffixed upload files should be renamed: {suffixed}"


def test_html_local_references_exist():
    missing = []

    for html_file in ROOT.glob("*.html"):
        parser = ReferenceParser()
        parser.feed(html_file.read_text(encoding="utf-8"))

        for reference in parser.references:
            path = local_path(reference)
            if path and not (ROOT / path).exists():
                missing.append(f"{html_file.name}: {reference} -> {path}")

    assert not missing, "Missing local references:\n" + "\n".join(sorted(missing))


if __name__ == "__main__":
    test_required_deploy_paths_exist()
    test_uploaded_browser_suffixes_are_not_deploy_sources()
    test_html_local_references_exist()
    print("Static site validation passed.")
