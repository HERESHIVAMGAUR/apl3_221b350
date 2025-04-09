import java.io.*;
class Singleton {
    private static Singleton uniqueinstance;
    private Singleton()
    {
        System.out.println("Singleton is Instantiated.");
    }
    public static Singleton getInstance()
    {
        if (uniqueinstance == null)
            uniqueinstance = new Singleton();
        return uniqueinstance;
    }

}

class Lazy {
    public static void main(String[] args)
    {
        Singleton.getInstance();
    }
}