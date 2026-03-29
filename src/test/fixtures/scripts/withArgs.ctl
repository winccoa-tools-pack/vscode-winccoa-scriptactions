// WinCC OA CTL script with arguments for testing
main(string arg1)
{
    DebugN("Script executed with argument:");
    DebugN("  arg1 =", arg1);
    
    // Verify argument is passed correctly (plain string, no -lflag prefix)
    if (strpos(arg1, "-lflag") >= 0)
    {
        DebugN("ERROR: Argument has -lflag prefix (should be plain string)");
    }
    else
    {
        DebugN("SUCCESS: Argument is plain string (correct)");
    }
}
