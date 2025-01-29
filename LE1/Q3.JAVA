class Mother {
    static void show() {
        System.out.println("Static Show of Mother");
    }
}
class Child extends Mother {
    static void show() {
        System.out.println("Static Show of Child");
    }
}
class Main {
    public static void main(String[] args) {
        Mother m1 = new Child();
        m1.show();
        Child c1 = new Child();
        c1.show();
    }
}