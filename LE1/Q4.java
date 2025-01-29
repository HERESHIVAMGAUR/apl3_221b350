class One {
    One(int x) {
        System.out.println("Constructor of One with x = " + x);
    }
}
class Two extends One {
    Two() {
        super(7);
        System.out.println("Constructor of Two");
    }
}
class Main {
    public static void main(String[] args) {
        Two t = new Two();
    }
}