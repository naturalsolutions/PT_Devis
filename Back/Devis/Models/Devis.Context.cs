﻿//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace Devis.Models
{
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Infrastructure;
    
    public partial class DevisEntities : DbContext
    {
        public DevisEntities()
            : base("name=DevisEntities")
        {
        }
    
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            throw new UnintentionalCodeFirstException();
        }
    
        public virtual DbSet<Ressource> Ressource { get; set; }
        public virtual DbSet<Tarification> Tarification { get; set; }
        public virtual DbSet<Tarification_Ressource> Tarification_Ressource { get; set; }
    }
}