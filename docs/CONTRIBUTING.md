# Contributing to Shark Robot Maze

## Coding Standards
- **Language:** TypeScript (strict mode)
- **Formatting:** Prettier (auto-format on save)
- **Linting:** ESLint (all code must pass lint)
- **File Structure:**
  - Modular: separate folders for player, robots, maze, powerups, UI, hazards
  - Keep files under 300 lines when possible
- **Naming:**
  - Descriptive, consistent, and no use of the word "pacman"
- **Documentation:**
  - TSDoc for all classes, functions, and modules
- **Testing:**
  - Use Jest for unit tests
  - Write tests for all logic-heavy modules

## Development Process
- Develop features incrementally, step by step
- Track and test dependencies as each feature is added
- Run `npm run lint`, `npm run format`, and `npm test` before submitting PRs
- All code must pass automated checks before merge
- Use clear, descriptive commit messages

## How to Contribute
1. Fork the repo and create your feature branch (`git checkout -b feature/my-feature`)
2. Make your changes and add tests
3. Run all checks (`npm run lint && npm run format && npm test`)
4. Commit your changes (`git commit -am 'Add new feature'`)
5. Push to the branch (`git push origin feature/my-feature`)
6. Create a Pull Request

## Code Review
- All code changes require review
- Address reviewer comments promptly

## Code of Conduct
Be respectful and collaborative. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) if present.
