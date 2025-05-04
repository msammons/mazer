# Shark Robot Maze Best Practices

## Entity Positioning
- **Grid Centering**: All entities (player, robots, pellets) should be centered in their grid cells by adding 0.5 to both x and y coordinates.
- **Z-Axis Positioning**: Use consistent Z-axis values:
  - Ground level: 0.0
  - Entity height: 0.1-0.5 (depending on entity size)
  - Wall height: 1.5

## Entity Sizing
- **Pellets**: Diameter 0.2
- **Power-ups**: Diameter 0.3
- **Robots**: Box size 0.8
- **Player**: Box size 0.8
- **Walls**: Thickness 0.5

## Movement Implementation
- **Player Movement**:
  - Use four cardinal directions (up, down, left, right)
  - Implement input buffering for direction changes
  - Restrict movement to corridor axes
  - Use consistent movement intervals (~180ms per tile)

- **Robot Movement**:
  - Use unique movement patterns for different robot types
  - Implement difficulty scaling based on level progression
  - Use protected spawn areas for robot respawning
  - Implement proper movement intervals (~300ms per tile)

## State Management
- **Game State**:
  - Maintain separate game state and UI state
  - Use immutable state updates
  - Implement proper event handling
  - Track player lives and robot states

- **Power-up States**:
  - Implement time-limited power-up effects
  - Track power-up availability
  - Handle power-up collision detection

## Memory Management
- **Mesh Management**:
  - Implement mesh pooling for dynamic objects
  - Clean up unused meshes
  - Use proper resource cleanup
  - Implement memory profiling

## Performance Optimization
- **Asset Loading**:
  - Implement proper asset caching
  - Use asset optimization pipeline
  - Implement hot-reloading in development
  - Optimize asset loading order

- **Rendering**:
  - Maintain 60 FPS target
  - Implement proper mesh culling
  - Optimize rendering batches
  - Use proper texture compression

## Babylon.js Best Practices
- **Scene Management**:
  - Create a single scene instance
  - Use proper scene cleanup
  - Implement proper camera management
  - Use consistent coordinate system

- **Mesh Management**:
  - Use mesh pooling for dynamic objects
  - Implement proper mesh disposal
  - Use instanced meshes when possible
  - Optimize mesh batching

- **Material Optimization**:
  - Reuse materials when possible
  - Use proper texture compression
  - Implement proper material disposal
  - Use PBR materials for consistent lighting

- **Animation**:
  - Use animation groups for complex animations
  - Implement proper animation disposal
  - Use keyframe animations for performance
  - Optimize animation frame rates

- **Physics**:
  - Use physics plugin for collision detection
  - Implement proper physics constraints
  - Optimize physics calculations
  - Use proper collision groups

## TypeScript Library Best Practices
- **React**:
  - Use functional components
  - Implement proper state management
  - Use proper prop typing
  - Implement proper error boundaries

- **Redux**:
  - Use proper action typing
  - Implement proper reducer composition
  - Use proper state normalization
  - Implement proper middleware

- **RxJS**:
  - Use proper observable typing
  - Implement proper subscription management
  - Use proper operator composition
  - Implement proper error handling

## Utility Library Best Practices
- **Lodash**:
  - Use proper method chaining
  - Implement proper type inference
  - Use proper collection methods
  - Implement proper array operations

- **Moment.js**:
  - Use proper date formatting
  - Implement proper timezone handling
  - Use proper date parsing
  - Implement proper date comparison

## Third-Party Integration
- **Analytics**:
  - Implement proper event tracking
  - Use proper data normalization
  - Implement proper error tracking
  - Use proper user identification

- **Authentication**:
  - Implement proper token management
  - Use proper session handling
  - Implement proper error handling
  - Use proper security measures

## Performance Monitoring
- **Memory Usage**:
  - Monitor heap usage
  - Track memory leaks
  - Implement proper cleanup
  - Use memory profiling tools

- **Frame Rate**:
  - Monitor FPS
  - Track dropped frames
  - Implement proper throttling
  - Use performance monitoring tools

## Security Best Practices
- **Input Validation**:
  - Validate all user input
  - Sanitize all output
  - Use proper type checking
  - Implement proper error handling

- **Authentication**:
  - Use proper token management
  - Implement proper session handling
  - Use proper error handling
  - Use proper security measures

## Error Handling
- **Game Errors**:
  - Implement centralized error logging
  - Handle non-critical failures gracefully
  - Provide clear error messages for debugging
  - Implement error boundaries for UI components

## Error Handling
- **Game Errors**:
  - Implement centralized error logging
  - Handle non-critical failures gracefully
  - Provide clear error messages for debugging
  - Implement error boundaries for UI components

## Code Organization
- **Module Structure**:
  - Keep related functionality in separate modules
  - Use clear naming conventions
  - Maintain consistent code style
  - Document all major components

## File Structure Guidelines
- **Maximum File Length**: 
  - Keep files under 300 lines
  - Split large files into smaller, focused modules
  - Use barrel files for exports when needed

- **File Naming**:
  - Use lowercase with hyphens for directories (e.g., `src/player/`)
  - Use camelCase for files (e.g., `playerMovement.ts`)
  - Include file type suffix (`.ts`, `.py`)

## TypeScript Coding Style
- **Type Definitions**:
  - Use interfaces for object shapes
  - Use types for unions and primitives
  - Avoid using `any` type
  - Use strict null checks

- **Class Structure**:
  - Keep classes under 200 lines
  - Use private/protected visibility
  - Implement proper constructor injection
  - Use getters/setters for complex logic

- **Function Guidelines**:
  - Keep functions under 30 lines
  - Use descriptive parameter names
  - Avoid side effects
  - Use early returns for clarity

- **Import/Export**:
  - Use named imports/exports
  - Group related imports
  - Avoid circular dependencies
  - Use barrel files for large modules

- **Error Handling**:
  - Use custom error classes
  - Implement proper try/catch
  - Log errors with context
  - Use error boundaries

## Python Coding Style
- **PEP 8 Compliance**:
  - Use 4-space indentation
  - Maximum line length: 79 characters
  - Use lowercase with underscores for variables
  - Use CapWords for classes

- **Type Hints**:
  - Use type hints for all functions
  - Use proper type annotations
  - Use Literal types for constants
  - Use Optional for nullable values

- **Function Guidelines**:
  - Keep functions under 20 lines
  - Use docstrings for all public functions
  - Use type hints consistently
  - Avoid global variables

- **Class Structure**:
  - Keep classes under 100 lines
  - Use class attributes for constants
  - Implement proper __init__
  - Use @property for computed values

- **Module Organization**:
  - One class per file
  - Clear __init__.py files
  - Proper __all__ exports
  - Avoid circular imports

## Code Quality
- **Linting**:
  - Use ESLint for TypeScript
  - Use flake8 for Python
  - Configure strict rules
  - Run linters on pre-commit

- **Formatting**:
  - Use Prettier for TypeScript
  - Use black for Python
  - Configure consistent settings
  - Format on save

- **Documentation**:
  - Use JSDoc for TypeScript
  - Use Sphinx for Python
  - Document all public APIs
  - Include examples

## Testing Guidelines
- **Test Structure**:
  - One test file per source file
  - Clear test naming
  - Proper test isolation
  - Mock external dependencies

- **Test Coverage**:
  - Aim for 80%+ coverage
  - Test edge cases
  - Verify error handling
  - Test performance critical paths

- **Test Organization**:
  - Group related tests
  - Use descriptive test names
  - Keep tests independent
  - Clean up test resources

## Version Control
- **Commit Messages**:
  - Use conventional commits
  - Include JIRA ticket numbers
  - Keep messages concise
  - Use imperative mood

- **Branching Strategy**:
  - Feature branches for new work
  - Hotfix branches for critical fixes
  - Release branches for versioning
  - Clear naming conventions

## Code Review
- **Review Checklist**:
  - Code style compliance
  - Type safety
  - Error handling
  - Performance impact
  - Test coverage

- **Review Process**:
  - At least one reviewer
  - Address all feedback
  - Document decisions
  - Maintain history

## Testing Guidelines
- **Unit Tests**:
  - Test core game logic
  - Verify component interactions
  - Check edge cases
  - Test performance critical paths

- **Integration Tests**:
  - Test component interactions
  - Verify game state transitions
  - Check collision detection
  - Test power-up effects

## Movement
- **Movement Intervals**:
  - Player: ~180ms per tile
  - Robots: ~300ms per tile
- **Direction Handling**: Use string literals for directions ('up', 'down', 'left', 'right')
- **Collision Detection**: Check grid bounds before moving

## Code Organization
- **Separation of Concerns**:
  - Maze logic in `maze/`
  - Player logic in `player/`
  - Robot logic in `robot/`
  - Utility functions in `utils/`
- **Type Safety**: Use TypeScript interfaces and types for all major components
- **Error Handling**: Proper error handling for critical operations

## Performance
- **Mesh Management**: Reuse meshes when possible instead of recreating
- **Update Frequency**: Limit update frequency for non-critical components
- **Memory Management**: Clean up unused meshes and resources

## Debugging
- **Debug Overlay**: Use debug overlay for displaying game state
- **Console Logging**: Use consistent logging format for debugging
- **Error Reporting**: Implement proper error reporting for critical failures

## Testing
- **Unit Tests**: Write unit tests for critical game logic
- **Integration Tests**: Test component interactions
- **Visual Testing**: Regularly test game visuals and movement

## Version Control
- **Commit Messages**: Use clear, descriptive commit messages
- **Branching**: Use feature branches for new development
- **Reverting**: Document reasons for reverting changes

## Future Improvements
- Add more best practices as they are discovered
- Regularly review and update this document
- Document any exceptions to these practices
