class Beer
{
    void pour(){
        System.out.println("pour 300ml Beer into a glass");
    }
    void add(){
       System.out.println("add a slice of lemon");
    }
    void stir(){
        System.out.println("no stirring required");
    }
    void serve(){
        System.out.println("serve through waiter");
    }
    
    public void templatemethod(){
        pour();
        add();
        stir();
        serve();
    }
}


