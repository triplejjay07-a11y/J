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


class ReferenceParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = []

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)

        for name in ("href", "src"):
            if attributes.get(name):
                self.references.append(attributes[name])

        if attributes.get("property") in {"og:image", "og:url"} and attributes.get("content"):
            self.references.append(attributes["content"])


def is_external(reference):
    parsed = urlparse(reference)
    return parsed.scheme in {"http", "https", "mailto", "tel", "sms"} or reference.startswith("//")


def resolve_reference(page, reference):
    if not reference or reference.startswith("#") or is_external(reference):
        return None

    parsed = urlparse(reference)
    path = unquote(parsed.path)
    if not path:
        return None

    if path.startswith("/"):
        candidate = ROOT / path.lstrip("/")
    else:
        candidate = page.parent / path

    if str(reference).endswith("/") or path.endswith("/"):
        candidate = candidate / "index.html"

    return candidate.resolve()


def test_required_deploy_paths_exist():
    missing = sorted(path for path in REQUIRED_PATHS if not (ROOT / path).is_file())
    assert missing == []


def test_uploaded_browser_suffixes_are_not_deployed():
    bad_paths = sorted(
        str(path.relative_to(ROOT))
        for path in ROOT.rglob("*")
        if ".git" not in path.parts and ("[" in path.name or "]" in path.name)
    )
    assert bad_paths == []


def test_html_local_references_exist():
    broken = []

    for page in ROOT.glob("*.html"):
        parser = ReferenceParser()
        parser.feed(page.read_text(encoding="utf-8"))

        for reference in parser.references:
            resolved = resolve_reference(page, reference)
            if resolved is not None and not resolved.is_file():
                broken.append(f"{page.name}: {reference}")

    assert sorted(broken) == []
