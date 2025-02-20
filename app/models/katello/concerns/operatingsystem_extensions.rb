module Katello
  module Concerns
    module OperatingsystemExtensions
      extend ActiveSupport::Concern

      REDHAT_ATOMIC_HOST_DISTRO_NAME = "Red Hat Enterprise Linux Atomic Host".freeze
      REDHAT_ATOMIC_HOST_OS = "RedHat_Enterprise_Linux_Atomic_Host".freeze

      included do
        after_create :assign_templates!
        before_create :set_atomic_attributes, :if => proc { |os| os.name == ::Operatingsystem::REDHAT_ATOMIC_HOST_OS }
      end

      def assign_templates!
        # Automatically assign default templates
        if self.family == 'Redhat'
          TemplateKind.all.each do |kind|
            if name == ::Operatingsystem::REDHAT_ATOMIC_HOST_OS && kind.name == "provision"
              provisioning_template_name = Setting["katello_default_atomic_provision"]
            else
              provisioning_template_name = Setting["katello_default_#{kind.name}"]
            end

            if (template = ProvisioningTemplate.unscoped.find_by_name(provisioning_template_name))
              provisioning_templates << template unless provisioning_templates.include?(template)
              if OsDefaultTemplate.where(:template_kind_id => kind.id, :operatingsystem_id => id).empty?
                OsDefaultTemplate.create(:template_kind_id => kind.id, :provisioning_template_id => template.id, :operatingsystem_id => id)
              end
            end
          end

          if (ptable = Ptable.unscoped.find_by_name(Setting["katello_default_ptable"]))
            ptables << ptable unless ptables.include?(ptable)
          end
        end
      end

      def set_atomic_attributes
        self.description = "#{::Operatingsystem::REDHAT_ATOMIC_HOST_DISTRO_NAME} #{release}"
        self.architectures << Architecture.where(:name => "x86_64").first_or_create
        self.family = "Redhat"
      end

      def atomic?
        name.match(/.*atomic.*/i)
      end

      def rhel_eos_schedule_index(arch_name: nil)
        return nil unless name == "RedHat" # using name and not title so we get specifically RHEL, not rebuilds
        return "RHEL#{major}" unless major == "7"
        case arch_name
        when "x86_64", nil
          "RHEL7"
        when "ppc64le"
          "RHEL7 (POWER9)"
        when "aarch64"
          "RHEL7 (ARM)"
        when "s390x"
          "RHEL7 (System z (Structure A))"
        else
          "RHEL#{major}"
        end
      end
    end
  end
end

class ::Operatingsystem::Jail < Safemode::Jail
  allow :atomic?
end
