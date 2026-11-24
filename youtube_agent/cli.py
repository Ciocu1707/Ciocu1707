"""Command-line entry point: one-shot (`youtube-agent "summarize URL"`) or interactive chat."""

from __future__ import annotations

import argparse
import json
import sys

import anthropic

from . import __version__
from .agent import MODEL, YouTubeAgent
from .tools import publish


def _confirm_interactive(summary: str) -> bool:
    print("\n--- The agent wants to make a change on YouTube ---")
    print(summary)
    try:
        answer = input("Proceed? [y/N] ").strip().lower()
    except EOFError:
        return False
    return answer in {"y", "yes"}


def _show_tool(name: str, args: dict) -> None:
    shown = json.dumps(args, ensure_ascii=False)
    if len(shown) > 160:
        shown = shown[:157] + "..."
    print(f"  -> {name} {shown}", file=sys.stderr, flush=True)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="youtube-agent",
        description="A Claude-powered YouTube agent: summaries & Q&A, creator help, research, publishing.",
    )
    parser.add_argument("prompt", nargs="*", help="Run a single request and exit. Omit for interactive chat.")
    parser.add_argument("--model", default=MODEL, help=f"Claude model (default: {MODEL}).")
    parser.add_argument(
        "--effort",
        default="high",
        choices=["low", "medium", "high", "xhigh", "max"],
        help="Reasoning effort (default: high).",
    )
    parser.add_argument("--read-only", action="store_true", help="Disable upload/edit tools.")
    parser.add_argument("--yes", action="store_true", help="Approve uploads/edits without asking (careful).")
    parser.add_argument("--quiet", action="store_true", help="Don't print tool calls.")
    parser.add_argument("--version", action="version", version=f"%(prog)s {__version__}")
    args = parser.parse_args(argv)

    publish.confirm = (lambda summary: True) if args.yes else _confirm_interactive
    agent = YouTubeAgent(model=args.model, effort=args.effort, allow_writes=not args.read_only)
    on_tool = None if args.quiet else _show_tool

    def run(text: str) -> None:
        try:
            agent.ask(text, on_text=lambda t: print(f"\n{t}\n"), on_tool=on_tool)
        except anthropic.AuthenticationError:
            print("Error: Claude API authentication failed. Set ANTHROPIC_API_KEY or run `ant auth login`.")
            raise SystemExit(1)
        except anthropic.RateLimitError:
            print("Rate limited by the Claude API; wait a moment and try again.")
        except anthropic.APIStatusError as e:
            print(f"Claude API error {e.status_code}: {e.message}")
        except anthropic.APIConnectionError:
            print("Could not reach the Claude API; check your network connection.")

    if args.prompt:
        run(" ".join(args.prompt))
        return 0

    print(f"YouTube agent ({args.model}). Paste a link or ask anything. /reset clears history, /quit exits.")
    while True:
        try:
            text = input("you> ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            return 0
        if not text:
            continue
        if text in {"/quit", "/exit"}:
            return 0
        if text == "/reset":
            agent.reset()
            print("History cleared.")
            continue
        run(text)


if __name__ == "__main__":
    raise SystemExit(main())
