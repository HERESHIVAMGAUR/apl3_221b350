import java.io.*;

class Singleton {
    private static Singleton uniqueinstance = new Singleton();
    private Singleton() {}

    public static Singleton getInstance() { return uniqueinstance; }
}

class Eager {
    public static void main(String[] args)
    {
        Singleton.getInstance();
    }
}