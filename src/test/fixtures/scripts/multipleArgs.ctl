// WinCC OA CTL script with multiple arguments
main(string testCase, int iterations)
{
    DebugN("Test script executing:");
    DebugN("  testCase =", testCase);
    DebugN("  iterations =", iterations);
    
    for (int i = 1; i <= iterations; i++)
    {
        DebugN("Iteration", i, "of", iterations);
    }
    
    DebugN("Test completed successfully");
}
