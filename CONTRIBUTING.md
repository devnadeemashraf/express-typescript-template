# Contributing to the project

First off, thank you for considering contributing to Express TypeScript Template! It's people like you that make this project such a great tool.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct. Please report unacceptable behavior to [dev.nadeemashraf06@gmail.com](mailto:dev.nadeemashraf06@gmail.com).

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report. Following these guidelines helps maintainers and the community understand your report, reproduce the behavior, and find related reports.

**Before Submitting A Bug Report:**

- Check the documentation for tips on using the template correctly.
- Check if the issue has already been reported in the [issue tracker](https://github.com/devnadeemashraf/express-typescript-template/issues).

**How Do I Submit A Good Bug Report?**

- Use a clear and descriptive title.
- Describe the exact steps which reproduce the problem.
- Provide specific examples to demonstrate the steps.
- Describe the behavior you observed after following the steps and why this is a problem.
- Explain what behavior you expected to see instead and why.
- Include screenshots or animated GIFs if applicable.
- If the problem is related to performance or memory, include a CPU profile capture.
- If the console shows any errors, include the exact error message.

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion, including completely new features and minor improvements to existing functionality.

**How Do I Submit A Good Enhancement Suggestion?**

- Use a clear and descriptive title.
- Provide a step-by-step description of the suggested enhancement.
- Provide specific examples to demonstrate the steps or point out the part of the template that could be improved.
- Explain why this enhancement would be useful to most users.
- List some other applications where this enhancement exists, if applicable.

### Pull Requests

- Fill in the required template.
- Do not include issue numbers in the PR title.
- Follow the [TypeScript](#typescript-styleguide) styleguide.
- Include screenshots and animated GIFs in your pull request whenever possible.
- Document new code.
- End all files with a newline.

## Styleguides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature").
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...").
- Limit the first line to 72 characters or less.
- Reference issues and pull requests liberally after the first line.
- When only changing documentation, include `[docs]` in the commit description.
- Consider starting the commit message with an applicable emoji:
  - 🎨 `:art:` when improving the format/structure of the code
  - 🐎 `:racehorse:` when improving performance
  - 🚱 `:non-potable_water:` when plugging memory leaks
  - 📝 `:memo:` when writing docs
  - 🐛 `:bug:` when fixing a bug
  - 🔥 `:fire:` when removing code or files
  - 💚 `:green_heart:` when fixing the CI build
  - ✅ `:white_check_mark:` when adding tests
  - 🔒 `:lock:` when dealing with security
  - ⬆️ `:arrow_up:` when upgrading dependencies
  - ⬇️ `:arrow_down:` when downgrading dependencies
  - 👕 `:shirt:` when removing linter warnings

### TypeScript Styleguide

- Use ESLint and Prettier with the project's configuration.
- Prefer `const` over `let` when the variable doesn't need to be reassigned.
- Use meaningful variable names.
- Use async/await instead of raw promises when possible.
- Comment your code when the logic is not immediately obvious.
- Organize imports in a consistent manner.

### Documentation Styleguide

- Use [Markdown](https://guides.github.com/features/mastering-markdown/).
- Reference methods and classes in markdown with the custom `{}` notation:
  - Reference classes with `{ClassName}`
  - Reference instance methods with `{ClassName#methodName}`
  - Reference class methods with `{ClassName.methodName}`

## Additional Notes

### Issue and Pull Request Labels

This section lists the labels we use to help us track and manage issues and pull requests.

**Type of Issue and Issue State**

- `enhancement`: Feature requests.
- `bug`: Confirmed bugs or reports that are likely to be bugs.
- `question`: Questions more than bug reports or feature requests.
- `feedback`: General feedback more than bug reports or feature requests.
- `help-wanted`: The core team would appreciate help from the community in resolving these issues.
- `beginner`: Less complex issues which would be good first issues to work on for users who want to contribute.
- `more-information-needed`: More information needs to be collected about these problems or feature requests.
- `needs-reproduction`: Likely bugs, but haven't been reliably reproduced.
- `blocked`: Issues blocked on other issues.
- `duplicate`: Issues which are duplicates of other issues.
- `wontfix`: The core team has decided not to fix these issues for now.
- `invalid`: Issues which aren't valid (e.g., user errors).

**Pull Request Labels**

- `work-in-progress`: Pull requests which are still being worked on, more changes will follow.
- `needs-review`: Pull requests which need code review and approval from maintainers.
- `under-review`: Pull requests being reviewed by maintainers.
- `requires-changes`: Pull requests which need to be updated based on review comments and then reviewed again.
- `needs-testing`: Pull requests which need manual testing.

## Thank You!

Your contributions to open source, large or small, make great projects like this possible. Thank you for taking the time to contribute.
