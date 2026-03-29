// WinCC OA CTL script that causes an error for testing error handling
main()
{
    DebugN("Error test script starting...");
    
    // Intentional error: undefined variable
    DebugN("Value:", undefinedVariable);
    
    DebugN("This should not be reached");
}
